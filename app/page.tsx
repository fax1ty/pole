"use client";

import Image from "next/image";
import wheelImg from "./wheel.png";
import spinnerImg from "./spinner.png";
import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "tailwind-cn";
import Fireworks from "react-canvas-confetti/dist/presets/fireworks";
import { TConductorInstance } from "react-canvas-confetti/dist/types";
import carImg from "./car.png";
import useTransition, { TransitionStatus } from "react-transition-state";
import raysImg from "./rays.png";
import chanceImg from "./chance.png";
import { useAudio } from "@/use-audio";

function randomWithProbability(weights: number[], results: number[]) {
  const num = Math.random();
  let s = 0;
  const lastIndex = weights.length - 1;

  for (let i = 0; i < lastIndex; ++i) {
    s += weights[i];
    if (num < s) {
      return results[i];
    }
  }

  return results[lastIndex];
}

function sum(array: number[]) {
  return array.reduce((partialSum, a) => partialSum + a, 0);
}

const SLOTS = 8;
const ROTATON_ANGLE = 360 / SLOTS;
const CHANCE_ANIMATION_DURATION = 6 * 1000;

enum Prize {
  PRIZE_250,
  PRIZE_500,
  CAR,
  PRIZE_50,
  PRIZE_150,
  CHANCE,
  PRIZE_300,
  PRIZE_400,
}

const BasePrize = ({
  visible,
  children,
}: {
  visible: boolean;
  children: (state: TransitionStatus) => ReactNode;
}) => {
  const [{ status, isMounted }, toggle] = useTransition({
    timeout: 300,
    mountOnEnter: true,
    unmountOnExit: true,
  });

  useEffect(() => {
    toggle(visible);
  }, [toggle, visible]);

  if (!isMounted) return null;

  return children(status);
};

const BasicChance = ({ visible }: { visible: boolean }) => (
  <BasePrize visible={visible}>
    {(status) => (
      <div className="w-[300px] h-[300px] absolute">
        <Image
          unoptimized
          alt=""
          src={chanceImg}
          className={cn(
            "absolute w-full h-full transition-transform duration-300",
            (status === "entering" || status === "exiting") && "scale-0"
          )}
        />
      </div>
    )}
  </BasePrize>
);

const MoneyPrize = ({
  visible,
  amount,
}: {
  visible: boolean;
  amount: number;
}) => (
  <BasePrize visible={visible}>
    {(status) => (
      <div
        className={cn(
          "w-[300px] h-[300px] absolute flex justify-center items-center transition-all duration-300",
          (status === "entering" || status === "exiting") &&
            "scale-0 translate-y-3"
        )}
      >
        <p className={"text-white font-[800] text-[64px]"}>{amount}</p>
      </div>
    )}
  </BasePrize>
);

const CarChance = ({ visible }: { visible: boolean }) => (
  <BasePrize visible={visible}>
    {(status) => (
      <div className="w-[300px] h-[300px] absolute">
        <span
          className={cn(
            "absolute scale-150 w-full h-full transition-all duration-300 flex",
            (status === "entering" || status === "exiting") &&
              "opacity-0 scale-0"
          )}
        >
          <Image
            unoptimized
            alt=""
            src={raysImg}
            className="animate-spin w-full h-full"
            style={{ animationDuration: "5s" }}
          />
        </span>
        <Image
          unoptimized
          alt=""
          src={carImg}
          className={cn(
            "absolute w-full h-full transition-transform duration-300",
            (status === "entering" || status === "exiting") && "scale-0"
          )}
        />
      </div>
    )}
  </BasePrize>
);

export default function Home() {
  const wheel = useRef<HTMLImageElement | null>(null);
  const [spinning, setSpinning] = useState(false);
  const results = useRef<number[]>([]);

  const chance = useRef(false);
  const confetti = useRef<TConductorInstance | null>(null);

  const [carChanceVisible, setCarChanceVisible] = useState(false);
  const [basicChanceVisible, setBasicChanceVisible] = useState(false);

  const [moneyPrizeVisible, setMoneyPrizeVisible] = useState(false);
  const [moneyAmount, setMoneyAmount] = useState(0);

  const { play: playSpin } = useAudio({ src: "/spin.mp3" });
  const { play: playChance } = useAudio({ src: "/super.mp3" });

  const showDefaulPrizeAnimation = (amount: number) => {
    setMoneyAmount(amount);
    setMoneyPrizeVisible(true);

    setTimeout(() => {
      setMoneyPrizeVisible(false);
    }, CHANCE_ANIMATION_DURATION);
  };
  const showChancePrizeAnimation = (type: "car" | "chance") => {
    confetti.current?.run({ speed: 0.8 });
    chance.current = true;

    if (type === "car") setCarChanceVisible(true);
    else setBasicChanceVisible(true);

    setTimeout(() => {
      if (type === "car") setCarChanceVisible(false);
      else setBasicChanceVisible(false);
    }, CHANCE_ANIMATION_DURATION);
  };

  return (
    <main className="flex flex-col min-h-screen w-full bg-[#031329] overflow-hidden">
      <div className="absolute w-full h-full flex justify-center items-center">
        <Fireworks
          onInit={({ conductor }) => {
            confetti.current = conductor;
          }}
          className="absolute w-full h-full"
        />
        <CarChance visible={carChanceVisible} />
        <BasicChance visible={basicChanceVisible} />
        <MoneyPrize visible={moneyPrizeVisible} amount={moneyAmount} />
      </div>

      <div className="flex flex-col absolute top-[32px] left-0 px-[30px] w-full">
        <h2 className="text-white text-center font-[Poppins] font-bold text-[32px]">
          Поле чудес
        </h2>

        <button
          disabled={spinning}
          className={cn(
            "mt-[22px] rounded-[20px] h-[64px] select-none",
            "transition-all duration-100",
            "bg-gradient-to-b from-[#21CC51] to-[#166E55]",
            "text-white font-[Poppins] font-bold text-[24px]",
            "active:scale-[0.85]",
            "disabled:opacity-70"
          )}
          onClick={async () => {
            setSpinning(true);
            playSpin();

            const result = randomWithProbability(
              [0.3, 0.05, 0.05, 0.1, 0.1, 0.05, 0.2, 0.15],
              [0, 1, 2, 3, 4, 5, 6, 7]
            );
            results.current.push(result);

            const rotations = results.current.map((v) => v * ROTATON_ANGLE);
            const rotation =
              -1 * (results.current.length * 5 * 360 + sum(rotations));

            if (!wheel.current) return;
            wheel.current.style.transform = `rotate(${rotation}deg)`;

            setTimeout(() => {
              switch (result) {
                case Prize.PRIZE_250:
                  showDefaulPrizeAnimation(250);
                  break;
                case Prize.PRIZE_500:
                  showDefaulPrizeAnimation(500);
                  break;
                case Prize.CAR:
                  showChancePrizeAnimation("car");
                  break;
                case Prize.PRIZE_50:
                  showDefaulPrizeAnimation(50);
                  break;
                case Prize.PRIZE_150:
                  showDefaulPrizeAnimation(150);
                  break;
                case Prize.CHANCE:
                  playChance();
                  showChancePrizeAnimation("chance");
                  break;
                case Prize.PRIZE_300:
                  showDefaulPrizeAnimation(300);
                  break;
                case Prize.PRIZE_400:
                  showDefaulPrizeAnimation(400);
                  break;
                default:
                  break;
              }

              setTimeout(async () => {
                if (chance.current) {
                  confetti.current?.stop();
                  chance.current = false;
                }
                setSpinning(false);
              }, CHANCE_ANIMATION_DURATION);
            }, 5 * 1000);
          }}
        >
          Крутить
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[600px] translate-y-1/2">
        <Image
          ref={wheel}
          alt=""
          src={wheelImg}
          priority
          className="absolute object-contain transition-transform will-change-transform duration-[5s] ease-in-out"
        />
        <Image
          alt=""
          src={spinnerImg}
          priority
          className="absolute object-contain"
        />
      </div>
    </main>
  );
}
