import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Background image */}
      <Image
        src="/background_image.png"
        alt="Background"
        fill
        priority
        quality={70}
        className="absolute inset-0 object-fill z-0"
      />

      {/* Card container with text overlay and analytics image */}
      <div className="relative z-10 top-45 left-45 w-[1000px] flex items-start gap-4">
        <div className="relative">
          <Image
            src="/landing_page_card.png"
            alt="detail card"
            width={470}
            height={300}
            priority
            quality={70}
            className="w-full h-full object-contain"
          />

          {/* Text + Button overlay */}
          <div className="absolute inset-0 flex flex-col items-start justify-start px-4 mt-[6rem] top-56">
            <p className="ml-[2rem] text-black text-xl font-semibold w-[80%] text-left mt-[1rem]">
              Playful planning for perfect weekends — craft your own mix of activities, moods, and meals, and turn two days into unforgettable memories.
            </p>

          {/* Green button full width */}
          <div className="relative w-[380px] h-[80px] mt-[1rem]">
            <Image
              src="/green_button.png"
              alt="Start Planning Button"
              fill
              quality={70}
              priority
              className="object-fill rounded-lg"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-xl">
              Start Planning
            </span>
          </div>
          </div>
        </div>

        {/* Analytics image */}
        <Image
          src="/analytics.png"
          alt="Analytics"
          width={550}
          height={150}
          priority
          quality={70}
          className="object-contain mt-[1rem] ml-[2.5rem]"
        />
      </div>
    </div>
  );
}
