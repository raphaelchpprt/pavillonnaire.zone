import Homepage from '@/components/Homepage';
import { ROOT_PATH } from '@/paths';

export default function Home() {
  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <h1 className="fixed z-10 mt-7 w-full text-center font-serif text-lg text-white mix-blend-difference">
        <a href={ROOT_PATH}>pavillonnaire.zone</a>
      </h1>

      <Homepage />
    </main>
  );
}
