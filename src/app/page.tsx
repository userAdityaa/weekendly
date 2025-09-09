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
        className="object-fill"
      />
    </div>
  );
}
