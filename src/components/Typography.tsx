import React from 'react';

export default function Typography() {
  return (
    <div className="space-y-12 p-8 bg-background text-foreground min-h-screen">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-orange">Typography System</h1>
        <p className="text-slate-400">
          The primary typeface for the Agency Landing Page is <strong>Inter</strong>. It is used across all headings and body text to maintain a clean, modern, and highly legible aesthetic.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-widest">Display / H1</p>
          <div className="flex items-baseline gap-6 border-b border-white/10 pb-4">
            <h1 className="text-5xl md:text-7xl font-black text-white w-2/3">Building Digital Authority</h1>
            <span className="text-slate-500 text-sm w-1/3 text-right">font-black (900) <br/> 5xl to 7xl</span>
          </div>
        </section>

        <section>
          <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-widest">Heading 2 / H2</p>
          <div className="flex items-baseline gap-6 border-b border-white/10 pb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white w-2/3">Transforming Brands</h2>
            <span className="text-slate-500 text-sm w-1/3 text-right">font-bold (700) <br/> 3xl to 4xl</span>
          </div>
        </section>

        <section>
          <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-widest">Heading 3 / H3</p>
          <div className="flex items-baseline gap-6 border-b border-white/10 pb-4">
            <h3 className="text-xl md:text-2xl font-semibold text-white w-2/3">Premium Services</h3>
            <span className="text-slate-500 text-sm w-1/3 text-right">font-semibold (600) <br/> xl to 2xl</span>
          </div>
        </section>

        <section>
          <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-widest">Body Text (Large)</p>
          <div className="flex items-baseline gap-6 border-b border-white/10 pb-4">
            <p className="text-lg md:text-xl text-slate-300 w-2/3">This is slightly larger body text often used as a subtitle or introductory paragraph to draw the user's attention.</p>
            <span className="text-slate-500 text-sm w-1/3 text-right">text-lg to xl <br/> text-slate-300</span>
          </div>
        </section>

        <section>
          <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-widest">Body Text (Base)</p>
          <div className="flex items-baseline gap-6 border-b border-white/10 pb-4">
            <p className="text-base text-slate-400 w-2/3">This is the standard body typography used for general content, descriptions, and paragraphs throughout the application.</p>
            <span className="text-slate-500 text-sm w-1/3 text-right">text-base <br/> text-slate-400</span>
          </div>
        </section>

        <section>
          <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-widest">Small / Metadata / Tags</p>
          <div className="flex items-baseline gap-6 border-b border-white/10 pb-4">
            <p className="text-sm text-slate-500 uppercase tracking-widest w-2/3">Small Uppercase Tag</p>
            <span className="text-slate-500 text-sm w-1/3 text-right">text-sm uppercase <br/> text-slate-500</span>
          </div>
        </section>
      </div>
    </div>
  );
}
