import { X } from "lucide-react";

interface PackagingModalProps {
  open: boolean;
  onClose: () => void;
}

const serviceLevels = [
  { tier: "Value Bulk", price: "~$22/card", turnaround: "40–60 biz days", max: "Max $499" },
  { tier: "Value", price: "~$28/card", turnaround: "30–40 biz days", max: "Max $999" },
  { tier: "Value Plus", price: "~$45/card", turnaround: "25–30 biz days", max: "Max $1,499" },
  { tier: "Regular", price: "~$75–100", turnaround: "15 biz days", max: "Max $2,499" },
  { tier: "Express", price: "~$150–300", turnaround: "5–10 biz days", max: "Higher value" },
  { tier: "Super Express", price: "$300+", turnaround: "3–5 biz days", max: "Grail-tier" },
];

export default function PackagingModal({ open, onClose }: PackagingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-t-2xl md:rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-medium text-foreground mb-6">Packaging & submission guide</h2>

        <Section title="Before you touch the card">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Handle by edges only — never touch the face or back surface directly</li>
            <li>• Use nitrile gloves for cards valued over $500</li>
            <li>• Work on a clean, soft surface — microfiber cloth on a flat table</li>
            <li>• Never slide a card across any surface</li>
          </ul>
        </Section>

        <Section title="Sleeving correctly">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use a brand new penny sleeve — never a used one</li>
            <li>• Insert the card face-first in one smooth motion</li>
            <li>• For SIR cards: the complex foil is extremely sensitive — minimize all contact with the face</li>
            <li>• Place the sleeved card into a Card Saver 1 semi-rigid holder</li>
            <li>• Do NOT use hard rigid top loaders for PSA</li>
          </ul>
        </Section>

        <Section title="Packaging for shipping">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Stack Card Saver holders face-to-face in pairs, secured with a loose rubber band</li>
            <li>• Wrap in at least two full layers of bubble wrap</li>
            <li>• Use a rigid cardboard box — never a padded envelope alone</li>
            <li>• Fill all empty space — zero movement allowed inside the box</li>
            <li>• Use USPS Priority Mail with full tracking and declared value insurance</li>
            <li>• Photograph your packed submission before sealing</li>
          </ul>
        </Section>

        <Section title="PSA service level guide (2025–2026)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left slab-label">
                  <th className="pb-2 pr-4">Tier</th>
                  <th className="pb-2 pr-4">Price</th>
                  <th className="pb-2 pr-4">Turnaround</th>
                  <th className="pb-2">Max Value</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {serviceLevels.map((s) => (
                  <tr key={s.tier} className="border-t border-border">
                    <td className="py-2 pr-4 text-foreground">{s.tier}</td>
                    <td className="py-2 pr-4">{s.price}</td>
                    <td className="py-2 pr-4">{s.turnaround}</td>
                    <td className="py-2">{s.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Always verify current pricing at psacard.com before submitting.</p>
        </Section>

        <Section title="Declared value tips">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Declare the current raw NM market value — not the graded value you hope to achieve</li>
            <li>• Under-declaring results in PSA upcharging you the difference</li>
            <li>• Your declared value determines your insurance coverage</li>
          </ul>
        </Section>

        <Section title="After you ship">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Save your tracking number and PSA submission ID</li>
            <li>• PSA's turnaround clock starts when they enter your order — not when it arrives</li>
            <li>• The receiving queue can take up to 15 business days during high volume</li>
            <li>• Track your order at psacard.com</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}
