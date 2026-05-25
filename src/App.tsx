import { useState } from "react";
import { FilterProvider } from "./lib/FilterContext";
import { ExecutiveSummary } from "./components/sections/ExecutiveSummary";
import { MenuMovers } from "./components/sections/MenuMovers";
import { KitchenPressure } from "./components/sections/KitchenPressure";
import { IngredientBurn } from "./components/sections/IngredientBurn";
import { MoneyIn } from "./components/sections/MoneyIn";
import { OwnerActionPlan } from "./components/sections/OwnerActionPlan";
import { DataNotesDrawer } from "./components/DataNotesDrawer";
import { FilterBar } from "./components/FilterBar";
import { FileText } from "lucide-react";

export default function App() {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <FilterProvider>
      <div className="min-h-screen pb-16">
        <header className="border-b border-rule/60 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-7xl flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-padma-green mb-2">
                Monthly Owner Report
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl text-charcoal leading-tight">
                Padmanadi Calgary
              </h1>
              <p className="text-charcoal-muted text-sm mt-1.5">
                May 2026 &middot; Synthetic POS data for demo purposes
              </p>
            </div>
            <button
              onClick={() => setNotesOpen(true)}
              className="flex items-center gap-1.5 text-xs text-charcoal-muted hover:text-padma-green transition-colors border border-rule rounded-md px-3 py-1.5"
            >
              <FileText size={14} />
              Data Notes
            </button>
          </div>
        </header>

        <FilterBar />

        <main className="mx-auto max-w-7xl px-4 sm:px-8">
          <ExecutiveSummary />
          <hr className="section-rule" />
          <MenuMovers />
          <hr className="section-rule" />
          <KitchenPressure />
          <hr className="section-rule" />
          <IngredientBurn />
          <hr className="section-rule" />
          <MoneyIn />
          <hr className="section-rule" />
          <OwnerActionPlan />

          <footer className="text-center text-xs text-charcoal-muted py-8 mt-8 border-t border-rule">
            Built with synthetic POS data &middot; Recipe and inventory figures are demo estimates, not actuals
          </footer>
        </main>

        <DataNotesDrawer open={notesOpen} onClose={() => setNotesOpen(false)} />
      </div>
    </FilterProvider>
  );
}
