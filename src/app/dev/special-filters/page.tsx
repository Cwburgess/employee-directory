// app/dev/special-filters/page.tsx
import SpecialFiltersPlayground from "@/components/dev/SpecialFiltersPlayground";

// Only render if explicitly enabled to keep this out of prod unintentionally.
export default function Page() {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_PLAYGROUND === "1";

  if (!enabled) {
    return (
      <div className="p-6 text-sm">
        Special Filters Playground is disabled.
        <br />
        Set <code>NEXT_PUBLIC_ENABLE_PLAYGROUND=1</code> in{" "}
        <code>.env.local</code> and restart dev server.
      </div>
    );
  }

  return <SpecialFiltersPlayground />;
}
