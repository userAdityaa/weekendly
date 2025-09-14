
'use client'
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Custom404() {
  const router = useRouter();

  const handleBack = () => { 
    router.push("/");
  }
  return (
    <div className='bg-white h-[100vh] w-[100vw] flex items-center justify-center'>
      <div className="flex flex-col gap-8 items-center">
        <Image
        src = '/404.png'
        alt="404"
        width={550}
        height={550}
        />

        <button className="text-zinc-800 font-semibold text-xl border border-zinc-200 bg-[#9ebd9eb5] w-[15vw] max-md:w-[50vw] p-3 rounded-xl" onClick={handleBack}>Go back to Home</button>
      </div>
    </div>
  );
}