import dynamic from 'next/dynamic';

const MapWithNoSSR = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-emerald-400 font-bold border border-emerald-500/30 p-4 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-3"></div>
      Chargement du Système d'Information Géographique (SIG)...
    </div>
  )
});

export default function InteractiveMap() {
  return <MapWithNoSSR />;
}
