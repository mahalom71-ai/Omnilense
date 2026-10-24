import React from 'react';
import { 
  X, 
  Grid, 
  Volume2, 
  VolumeX, 
  Compass, 
  Camera, 
  Smartphone, 
  Monitor, 
  Check,
  Layers,
  Sparkles
} from 'lucide-react';
import { GridType, VirtualScene } from '../types/camera';
import { VIRTUAL_SCENES } from '../utils/syntheticScenes';
import { cameraAudio } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: GridType;
  onSelectGrid: (grid: GridType) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isSimulated: boolean;
  onToggleSimulated: (simulated: boolean) => void;
  activeSceneId: string;
  onSelectScene: (id: string) => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  highRes50MP: boolean;
  onToggleHighRes: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  grid,
  onSelectGrid,
  soundEnabled,
  onToggleSound,
  isSimulated,
  onToggleSimulated,
  activeSceneId,
  onSelectScene,
  isPhoneFrame,
  onTogglePhoneFrame,
  highRes50MP,
  onToggleHighRes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-wide">Camera Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section 1: Viewport & Presentation Mode */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Display Mode</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (isPhoneFrame) onTogglePhoneFrame();
              }}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                !isPhoneFrame
                  ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300'
              }`}
            >
              <Smartphone size={18} />
              <div className="text-left">
                <div className="text-xs font-bold">Edge-to-Edge</div>
                <div className="text-[10px] text-neutral-400">Native mobile screen</div>
              </div>
            </button>

            <button
              onClick={() => {
                if (!isPhoneFrame) onTogglePhoneFrame();
              }}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                isPhoneFrame
                  ? 'bg-amber-400/15 border-amber-400 text-amber-300'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300'
              }`}
            >
              <Monitor size={18} />
              <div className="text-left">
                <div className="text-xs font-bold">Pixel 9 Pro Frame</div>
                <div className="text-[10px] text-neutral-400">Hardware phone chassis</div>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Camera Feed Source */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Camera Sensor Source</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onToggleSimulated(false)}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                !isSimulated
                  ? 'bg-emerald-400/15 border-emerald-400 text-emerald-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300'
              }`}
            >
              <Camera size={18} />
              <div className="text-left">
                <div className="text-xs">Live Device WebCam</div>
                <div className="text-[10px] text-neutral-400">Physical phone camera</div>
              </div>
            </button>

            <button
              onClick={() => onToggleSimulated(true)}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                isSimulated
                  ? 'bg-amber-400/15 border-amber-400 text-amber-300 font-bold'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300'
              }`}
            >
              <Sparkles size={18} />
              <div className="text-left">
                <div className="text-xs">Pixel Lab Test Scenes</div>
                <div className="text-[10px] text-neutral-400">Test 5x & 10x details</div>
              </div>
            </button>
          </div>

          {/* Test Scene selector if simulated */}
          {isSimulated && (
            <div className="mt-2 space-y-1.5 p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800">
              <span className="text-[11px] text-neutral-400 block mb-1">Select Simulated Scene:</span>
              {VIRTUAL_SCENES.map(scene => (
                <button
                  key={scene.id}
                  onClick={() => onSelectScene(scene.id)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all ${
                    activeSceneId === scene.id
                      ? 'bg-amber-400 text-black font-bold'
                      : 'hover:bg-neutral-800 text-neutral-300'
                  }`}
                >
                  <div>
                    <div className="text-xs">{scene.name}</div>
                    <div className={`text-[10px] ${activeSceneId === scene.id ? 'text-black/75' : 'text-neutral-500'}`}>
                      {scene.description}
                    </div>
                  </div>
                  {activeSceneId === scene.id && <Check size={16} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Composition Grid */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Framing & Grids</span>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {(['none', '3x3', 'golden', 'square'] as GridType[]).map(g => (
              <button
                key={g}
                onClick={() => onSelectGrid(g)}
                className={`py-2 rounded-xl border text-center font-medium capitalize transition-all ${
                  grid === g
                    ? 'bg-amber-400 text-black border-amber-400 font-bold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {g === 'none' ? 'Off' : g}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Resolution & Audio Toggles */}
        <div className="space-y-3 pt-2 border-t border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-neutral-200">50MP Ultra High Resolution</div>
              <div className="text-[10px] text-neutral-400">Full sensor readout for superior cropping & prints</div>
            </div>
            <button
              onClick={onToggleHighRes}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                highRes50MP ? 'bg-amber-400' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-neutral-950 absolute top-1 transition-transform ${
                  highRes50MP ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 size={16} className="text-amber-400" /> : <VolumeX size={16} className="text-neutral-400" />}
              <div>
                <div className="text-xs font-bold text-neutral-200">Pixel Shutter Audio</div>
                <div className="text-[10px] text-neutral-400">Tactile mechanical clicks and timer beeps</div>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                soundEnabled ? 'bg-amber-400' : 'bg-neutral-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-neutral-950 absolute top-1 transition-transform ${
                  soundEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
