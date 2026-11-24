import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Language } from '../../i18n/types';
import { useAudioGuide } from '../../contexts/AudioGuideContext';
import { HeritageTypographicPlate } from '../common/HeritageTypographicPlate';
import { HeritageSmoothImage } from '../common/HeritageSmoothImage';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  X,
  Music,
} from 'lucide-react';

interface FloatingAudioBarProps {
  onOpenStudio: (siteId: string) => void;
  offsetAboveRouteBar?: boolean;
  customBottomClass?: string;
  hideOnDesktop?: boolean;
}

const FloatingAudioProgressLine: React.FC = React.memo(() => {
  const { getPlaybackProgress, subscribePlaybackProgress } = useAudioGuide();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apply = (pct: number) => {
      if (barRef.current) {
        barRef.current.style.width = `${Math.max(2, Math.min(100, pct))}%`;
      }
    };
    apply(getPlaybackProgress());
    return subscribePlaybackProgress((pct) => apply(pct));
  }, [getPlaybackProgress, subscribePlaybackProgress]);

  return (
    <div className="h-[1.5px] w-full bg-white/[0.06] relative overflow-hidden">
      <div
        ref={barRef}
        className="h-full bg-[#C5A059] transition-all duration-300"
        style={{ width: `${Math.max(2, Math.min(100, getPlaybackProgress()))}%` }}
      />
    </div>
  );
});

export const FloatingAudioBar: React.FC<FloatingAudioBarProps> = React.memo(({
  onOpenStudio,
  offsetAboveRouteBar = false,
  customBottomClass,
  hideOnDesktop = false,
}) => {
  const { lang, setLang, getLocalizedSite } = useI18n();
  const {
    activeSite,
    activeChapter,
    sentences,
    activeSentenceIndex,
    isPlaying,
    playbackSpeed,
    customAudio,
    isUsingCustomAudio,
    isFloatingBarVisible,
    togglePlayPause,
    prevChapter,
    nextChapter,
    selectedChapterIdx,
    chapters,
    cycleSpeed,
    dismissFloatingBar,
  } = useAudioGuide();

  const [thumbFailed, setThumbFailed] = useState<boolean>(false);

  useEffect(() => {
    setThumbFailed(false);
  }, [activeSite?.id, activeSite?.photos?.[0]]);

  if (!isFloatingBarVisible) return null;

  const localizedSite = getLocalizedSite(activeSite);
  const thumbPhotoUrl = activeSite.photos?.[0] || '';
  const hasValidThumb = Boolean(thumbPhotoUrl) && !thumbFailed;
  const currentSentence =
    sentences[activeSentenceIndex] || activeChapter?.narration || localizedSite.summary;

  return (
    <div
      role="region"
      aria-label={
        lang === 'zh'
          ? '语音导览悬浮播放器'
          : lang === 'en'
          ? 'Floating Audio Guide Player'
          : 'Thanh phát Thuyết minh Di sản'
      }
      className={`${
        hideOnDesktop ? 'md:hidden ' : ''
      }fixed left-3 right-3 sm:right-auto sm:left-5 sm:w-[440px] md:w-[480px] z-40 rounded-2xl bg-[#1D1D1F]/92 backdrop-blur-2xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden transition-all animate-apple-sheet ${
        customBottomClass ? customBottomClass : offsetAboveRouteBar ? 'bottom-[70px]' : 'bottom-5'
      }`}
    >
      {/* Top Champagne Gold hairline (isolated subscription, zero parent re-renders) */}
      <FloatingAudioProgressLine />

      <div className="px-3.5 py-2.5 flex items-center gap-3">
        {/* Thumbnail + 4 Animated Champagne Gold Equalizer Bars */}
        <button
          type="button"
          onClick={() => onOpenStudio(activeSite.id)}
          className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/[0.12] bg-[#171817] group cursor-pointer"
          title={
            lang === 'zh'
              ? '打开完整语音导览演播室'
              : lang === 'en'
              ? 'Expand Full Audio Guide Studio'
              : 'Mở phòng thu Thuyết minh đầy đủ'
          }
        >
          {hasValidThumb ? (
            <HeritageSmoothImage
              src={thumbPhotoUrl}
              alt={localizedSite.officialName}
              loading="lazy"
              waitTone="dark"
              onError={() => setThumbFailed(true)}
              className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-[opacity,transform] duration-500"
            />
          ) : (
            <HeritageTypographicPlate site={activeSite} variant="compact" />
          )}
          <div className="absolute inset-0 bg-black/45 flex items-end justify-center gap-[2.5px] pb-2">
            <span
              className={`w-[2.5px] rounded-full bg-[#C5A059] ${
                isPlaying ? 'h-4 animate-soundwave-1' : 'h-1.5 opacity-70'
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full bg-[#E8CA68] ${
                isPlaying ? 'h-4 animate-soundwave-2' : 'h-2.5 opacity-70'
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full bg-[#C5A059] ${
                isPlaying ? 'h-4 animate-soundwave-3' : 'h-1.5 opacity-70'
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full bg-[#E8CA68] ${
                isPlaying ? 'h-4 animate-soundwave-4' : 'h-2 opacity-70'
              }`}
            />
          </div>
        </button>

        {/* Site & Live Teleprompter Line */}
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-[#F5F5F7] truncate">
              {localizedSite.officialName}
            </span>
            {isUsingCustomAudio && customAudio ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-[#47796D] text-[#F7F3EB] font-sans text-[9.5px] font-medium tracking-[0.01em] shrink-0">
                <Music className="w-2.5 h-2.5 shrink-0" />
                {lang === 'en'
                  ? 'Narrator Recording'
                  : lang === 'zh'
                  ? '讲解员原声录音'
                  : 'Bản thu âm thuyết minh viên'}
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-[3px] border border-[#C9A46A]/40 bg-[#C9A46A]/15 text-[#C9A46A] font-sans text-[9.5px] font-medium shrink-0">
                {lang === 'en' ? 'AI Voice' : lang === 'zh' ? 'AI 语音' : 'Giọng đọc AI'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#86868B] truncate mt-0.5">
            {isUsingCustomAudio && customAudio
              ? customAudio.fileName
              : currentSentence}
          </p>
        </div>

        {/* Transport & Quick Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Language Switcher VI | EN | ZH */}
          <div className="hidden sm:inline-flex items-center rounded-lg bg-black/45 border border-white/[0.08] p-0.5 mr-0.5">
            {(['vi', 'en', 'zh'] as Language[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold uppercase transition-colors cursor-pointer ${
                  lang === code
                    ? 'bg-[#C5A059] text-[#121110]'
                    : 'text-[#86868B] hover:text-[#F5F5F7]'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Speed Cycle 0.85x | 1.0x | 1.2x */}
          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] font-sans text-[11px] font-semibold text-[#C5A059] cursor-pointer tabular-nums"
            title={lang === 'en' ? 'Playback speed' : lang === 'zh' ? '语速切换' : 'Tốc độ đọc'}
          >
            {playbackSpeed === 1 ? '1.0x' : `${playbackSpeed}x`}
          </button>

          <button
            type="button"
            onClick={prevChapter}
            disabled={selectedChapterIdx === 0 || isUsingCustomAudio}
            className="hidden md:flex w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] disabled:opacity-30 text-[#F5F5F7] items-center justify-center cursor-pointer"
            aria-label="Previous chapter"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="w-8 h-8 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center justify-center shadow-md cursor-pointer transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-white text-white" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5 fill-white text-white" />
            )}
          </button>

          <button
            type="button"
            onClick={nextChapter}
            disabled={selectedChapterIdx >= chapters.length - 1 || isUsingCustomAudio}
            className="hidden md:flex w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] disabled:opacity-30 text-[#F5F5F7] items-center justify-center cursor-pointer"
            aria-label="Next chapter"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onOpenStudio(activeSite.id)}
            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-[#F5F5F7] flex items-center justify-center cursor-pointer"
            title={lang === 'en' ? 'Open Audio Guide Studio' : lang === 'zh' ? '展开导览面板' : 'Mở bảng Thuyết minh'}
            aria-label="Expand audio guide"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={dismissFloatingBar}
            className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-[#FF453A]/20 text-[#86868B] hover:text-[#FF453A] flex items-center justify-center cursor-pointer transition-colors"
            title={lang === 'en' ? 'Stop & Close' : lang === 'zh' ? '停止并关闭' : 'Dừng & Đóng'}
            aria-label="Close audio bar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

export const DockedSidebarAudioBar: React.FC<{
  onOpenStudio: (siteId: string) => void;
}> = React.memo(({ onOpenStudio }) => {
  const { lang, getLocalizedSite } = useI18n();
  const {
    activeSite,
    activeChapter,
    sentences,
    activeSentenceIndex,
    isPlaying,
    playbackSpeed,
    customAudio,
    isUsingCustomAudio,
    isFloatingBarVisible,
    togglePlayPause,
    cycleSpeed,
    dismissFloatingBar,
  } = useAudioGuide();

  if (!isFloatingBarVisible) return null;

  const localizedSite = getLocalizedSite(activeSite);
  const currentSentence =
    sentences[activeSentenceIndex] || activeChapter?.narration || localizedSite.summary;

  return (
    <div
      role="region"
      aria-label={
        lang === 'zh'
          ? '语音导览播放器'
          : lang === 'en'
          ? 'Docked Audio Guide Player'
          : 'Trình phát thuyết minh di tích'
      }
      className="bg-[#F7F2E9] border-b border-[#DCD3C3] shrink-0 overflow-hidden"
    >
      <FloatingAudioProgressLine />
      <div className="px-3 py-2 flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlayPause}
          className="w-8 h-8 rounded-lg bg-[#A63A2B] hover:bg-[#8E3023] text-[#F7F2E9] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
          )}
        </button>

        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11.5px] font-semibold text-[#2C241E] truncate">
              {localizedSite.officialName}
            </span>
            {isUsingCustomAudio && customAudio && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-[#3A665B]/15 border border-[#3A665B]/30 text-[#3A665B] text-[9.5px] font-semibold shrink-0">
                <Music className="w-2.5 h-2.5" />
                <span>.m4a</span>
              </span>
            )}
          </div>
          <p className="text-[10.5px] text-[#5C5347] truncate m-0">
            {isUsingCustomAudio && customAudio ? customAudio.fileName : currentSentence}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={cycleSpeed}
            className="h-7 px-1.5 rounded-md bg-[#EFE7D8] hover:bg-[#E4DAC7] border border-[#DCD3C3] text-[10.5px] font-semibold text-[#2C241E] tabular-nums cursor-pointer"
            title={lang === 'en' ? 'Playback speed' : lang === 'zh' ? '语速' : 'Tốc độ phát'}
          >
            {playbackSpeed === 1 ? '1.0x' : `${playbackSpeed}x`}
          </button>
          <button
            type="button"
            onClick={() => onOpenStudio(activeSite.id)}
            className="w-7 h-7 rounded-md bg-[#EFE7D8] hover:bg-[#E4DAC7] border border-[#DCD3C3] text-[#2C241E] flex items-center justify-center cursor-pointer"
            title={lang === 'en' ? 'Open Audio Studio' : lang === 'zh' ? '打开导览' : 'Mở bảng thuyết minh'}
            aria-label="Open audio studio"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={dismissFloatingBar}
            className="w-7 h-7 rounded-md bg-[#EFE7D8] hover:bg-[#A63A2B] border border-[#DCD3C3] text-[#5C5347] hover:text-[#F7F2E9] flex items-center justify-center cursor-pointer transition-colors"
            title={lang === 'en' ? 'Stop & Close' : lang === 'zh' ? '停止并关闭' : 'Dừng & Đóng'}
            aria-label="Close docked audio"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
});
