import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { PracticeSetup } from "@/components/accountant/PracticeSetup";
import { useStore } from "@/lib/app-store";

export const Route = createFileRoute("/practice-profile")({
  head: () => ({
    meta: [
      { title: "Practice profile — rate, hours and location" },
      {
        name: "description",
        content:
          "Edit your accountant profile: name, photo, map location, rate, booking days and holiday mode.",
      },
      { property: "og:title", content: "Practice profile — Fisco" },
      {
        property: "og:description",
        content: "Set your rate, availability, location and holiday mode.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PracticeProfileRoute,
});

function PracticeProfileRoute() {
  const { practice, savePractice } = useStore();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Practice profile" back right={<span />} />
      <div className="mx-auto w-full max-w-[620px] px-4 pt-4 pb-36">
        <PracticeSetup
          mode="edit"
          value={practice}
          onSave={(p) => {
            savePractice(p);
            window.setTimeout(() => navigate({ to: "/profile" }), 500);
          }}
        />
      </div>
    </div>
  );
}
