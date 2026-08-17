import {useEffect, useRef, useState} from 'react';
import {Globe} from 'lucide-react';
import {AVATARS, updateProfile, type PolymindProfile} from '../profile/profileStore';
import {applyIdentityToAllGames, applyLanguageToAllGames} from './gameBridge';
import type {SharedLanguage} from './language';
import {t} from './i18n';

interface ProfileBarProps {
  profile: PolymindProfile;
  onChange: (profile: PolymindProfile) => void;
}

const LANGUAGES: {code: SharedLanguage; short: string; label: string}[] = [
  {code: 'en', short: 'EN', label: 'English'},
  {code: 'zh-CN', short: '简', label: '简体中文'},
  {code: 'zh-TW', short: '繁', label: '繁體中文'},
];

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [onOutside]);
  return ref;
}

export default function ProfileBar({profile, onChange}: ProfileBarProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [pickingLanguage, setPickingLanguage] = useState(false);

  const avatarRef = useClickOutside(() => setPickingAvatar(false));
  const languageRef = useClickOutside(() => setPickingLanguage(false));

  function commitName() {
    const trimmed = nameDraft.trim().slice(0, 20);
    if (trimmed) {
      applyIdentityToAllGames(trimmed, profile.avatar);
      onChange(updateProfile({name: trimmed}));
    }
    setEditingName(false);
  }

  function pickAvatar(a: string) {
    applyIdentityToAllGames(profile.name, a);
    onChange(updateProfile({avatar: a}));
    setPickingAvatar(false);
  }

  function pickLanguage(lang: SharedLanguage) {
    applyLanguageToAllGames(lang);
    onChange(updateProfile({language: lang}));
    setPickingLanguage(false);
  }

  const currentLang = LANGUAGES.find((l) => l.code === profile.language) ?? LANGUAGES[0];
  const lang = profile.language as SharedLanguage;

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-slate-900/70 border border-slate-800 pl-1.5 pr-2 py-1.5 backdrop-blur">
      <div className="relative" ref={avatarRef}>
        <button
          onClick={() => setPickingAvatar((v) => !v)}
          className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-lg hover:bg-slate-700 transition-colors"
          aria-label={t(lang, 'changeAvatar')}
        >
          {profile.avatar}
        </button>
        {pickingAvatar && (
          <div className="absolute top-11 left-0 z-50 grid grid-cols-4 gap-1 p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-xl w-40">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => pickAvatar(a)}
                className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-lg"
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {editingName ? (
        <input
          autoFocus
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => e.key === 'Enter' && commitName()}
          className="bg-slate-800 rounded-md px-2 py-0.5 text-sm w-28 outline-none ring-1 ring-fuchsia-500"
        />
      ) : (
        <button
          onClick={() => {
            setNameDraft(profile.name);
            setEditingName(true);
          }}
          className="text-sm font-semibold text-slate-100 hover:text-fuchsia-300 transition-colors max-w-[9rem] truncate"
          title={t(lang, 'clickToRename')}
        >
          {profile.name}
        </button>
      )}

      <div className="relative" ref={languageRef}>
        <button
          onClick={() => setPickingLanguage((v) => !v)}
          className="flex items-center gap-1 w-8 h-8 rounded-full justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors text-[10px] font-bold"
          aria-label={t(lang, 'changeLanguage')}
          title={t(lang, 'languageTooltip')}
        >
          <Globe size={13} />
        </button>
        {pickingLanguage && (
          <div className="absolute top-11 right-0 z-50 flex flex-col gap-0.5 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-xl w-32">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => pickLanguage(l.code)}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs hover:bg-slate-800 transition-colors ${
                  l.code === currentLang.code ? 'text-fuchsia-300 font-semibold' : 'text-slate-300'
                }`}
              >
                <span>{l.label}</span>
                <span className="text-[10px] text-slate-500">{l.short}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
