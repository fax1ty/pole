"use client";

import { useAudio } from "@/use-audio";

export default function AdminPage() {
  const { toggle: toggleStart } = useAudio({ src: "/start.mp3" });
  const { toggle: toggleWelcome } = useAudio({ src: "/welcome.mp3" });
  const { toggle: toggleCorrectChar } = useAudio({ src: "/correct-char.mp3" });
  const { toggle: toggleCorrectWord } = useAudio({ src: "/correct-word.mp3" });
  const { toggle: toggleWrongWord } = useAudio({ src: "/wrong-word.mp3" });
  const { toggle: toggleCar } = useAudio({ src: "/car.mp3" });

  return (
    <div className="flex flex-col p-4 gap-2">
      {[
        { label: "Начальная заставка", toggle: toggleStart },
        { label: "Представление участников", toggle: toggleWelcome },
        { label: "Правильная буква", toggle: toggleCorrectChar },
        { label: "Правильное слово", toggle: toggleCorrectWord },
        { label: "Не правильное слово", toggle: toggleWrongWord },
        { label: "Выиграна машина", toggle: toggleCar },
      ].map(({ label, toggle }, i) => (
        <button
          key={i}
          onClick={toggle}
          className="px-4 py-2 text-white bg-indigo-600 rounded-lg duration-150 hover:bg-indigo-700 active:shadow-lg"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
