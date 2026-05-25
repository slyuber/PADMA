import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DataNotesDrawer({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-rice z-50 shadow-xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 overflow-y-auto h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl text-charcoal">Data Notes</h2>
            <button onClick={onClose} className="text-charcoal-muted hover:text-charcoal">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 text-sm text-charcoal-light leading-relaxed">
            <section>
              <h3 className="font-semibold text-charcoal mb-1">POS Data</h3>
              <p>
                All order and transaction data is <strong>synthetically generated</strong> for
                demonstration purposes. It models a busy vegan restaurant doing 80-120 orders/day
                with realistic time-of-day and day-of-week patterns based on Google busy-times data
                for the actual Padmanadi Calgary location.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-charcoal mb-1">Menu Prices</h3>
              <p>
                Menu catalog prices are based on the actual Padmanadi Calgary menu as of late 2025.
                Transaction line totals in order_items reflect the price at time of sale (which may
                differ from current catalog if the menu has changed). Revenue figures use transaction
                line_total, not catalog price.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-charcoal mb-1">Recipe &amp; Ingredient Data</h3>
              <p>
                Recipe ingredients, quantities, and inventory targets are <strong>estimated
                assumptions</strong> created for this demo. They are directional only and do not
                reflect actual Padmanadi purchasing, recipes, or supplier relationships. Do not use
                these figures for real purchasing decisions.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-charcoal mb-1">Tax Figures</h3>
              <p>
                Alberta levies 5% GST (no provincial sales tax). GST shown is the amount collected
                from synthetic POS records for May 2026 only. Figures are labeled "GST reserve
                before ITCs" because actual remittance depends on input tax credits the business
                would claim. This is a directional estimate, not tax advice.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-charcoal mb-1">Kitchen Pressure &amp; Complexity</h3>
              <p>
                The complexity score is a directional metric combining ingredient count, prep-group
                diversity, spicy/sauce flags, and modifier frequency. It is not benchmarked against
                industry standards.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-charcoal mb-1">What This Report Is Not</h3>
              <p>
                This is not connected to live POS, inventory, or weather systems. It does not
                reflect actual Padmanadi business performance. It is a visualization demo built on
                synthetic data.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
