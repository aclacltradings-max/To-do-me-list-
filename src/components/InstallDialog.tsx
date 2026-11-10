import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { CheckCircleIcon, DownloadIcon, ShareIcon } from './Icons';
import type { Platform } from '../hooks/useInstallPrompt';

interface InstallDialogProps {
  open: boolean;
  onClose: () => void;
  platform: Platform;
  /** Whether a native install prompt is available right now. */
  canInstall: boolean;
  onInstall: () => void;
}

const STEPS: Record<Platform, { icon: 'share' | 'download' | 'check'; text: string }[]> = {
  ios: [
    { icon: 'share', text: 'Tap the Share button in Safari\u2019s toolbar.' },
    { icon: 'download', text: 'Scroll down and tap “Add to Home Screen”.' },
    { icon: 'check', text: 'Tap “Add”. FinTrack now opens like a native app.' },
  ],
  android: [
    { icon: 'download', text: 'Open the browser menu (⋮ in the top-right corner).' },
    { icon: 'check', text: 'Tap “Install app” or “Add to Home screen”.' },
    { icon: 'check', text: 'Confirm to add FinTrack to your home screen.' },
  ],
  desktop: [
    { icon: 'download', text: 'Look for the install icon in the address bar, or open the browser menu.' },
    { icon: 'check', text: 'Choose “Install FinTrack”.' },
    { icon: 'check', text: 'It opens in its own window from your apps list.' },
  ],
  other: [
    { icon: 'download', text: 'Open your browser menu and look for “Install” or “Add to Home screen”.' },
    { icon: 'check', text: 'Confirm to install FinTrack on your device.' },
  ],
};

function StepIcon({ kind }: { kind: 'share' | 'download' | 'check' }) {
  if (kind === 'share') return <ShareIcon className="h-4 w-4" />;
  if (kind === 'download') return <DownloadIcon className="h-4 w-4" />;
  return <CheckCircleIcon className="h-4 w-4" />;
}

const PERKS = [
  'Works offline — no internet needed',
  'Launches in its own window, no browser chrome',
  'Your data stays on this device',
];

/** Explains how to install the app, adapting to the current platform. */
export function InstallDialog({
  open,
  onClose,
  platform,
  canInstall,
  onInstall,
}: InstallDialogProps) {
  const steps = STEPS[platform];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Install FinTrack"
      description="Add FinTrack to your device for one-tap access, even offline."
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 p-4 text-white">
          <img
            src="/icon-192.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold">FinTrack</p>
            <p className="text-xs text-white/85">Personal finance tracker</p>
          </div>
        </div>

        <ul className="space-y-2">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {perk}
            </li>
          ))}
        </ul>

        {canInstall ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your browser supports installing in one click.
            </p>
            <Button block size="lg" onClick={onInstall}>
              <DownloadIcon className="h-5 w-5" />
              Install now
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {platform === 'ios' ? 'On iPhone or iPad' : 'To install manually'}
            </p>
            <ol className="mt-3 space-y-3">
              {steps.map((step, index) => (
                <li key={step.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {index + 1}
                  </span>
                  <span className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <StepIcon kind={step.icon} />
                    {step.text}
                  </span>
                </li>
              ))}
            </ol>
            {platform === 'ios' && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                Installation works in Safari. In other browsers, tap Share and look for
                “Add to Home Screen”.
              </p>
            )}
          </div>
        )}

        <Button variant="ghost" block onClick={onClose}>
          {canInstall ? 'Maybe later' : 'Got it'}
        </Button>
      </div>
    </Modal>
  );
}
