import ContactPill from "@/components/ContactPill";

export default function AddBuild() {
  return (
    <ContactPill
      about="archive"
      pill={{ en: "Built something in the club? Add it to the archive", ko: "동아리에서 만든 작품이 있나요? 아카이브에 올려 주세요" }}
      ask={{ en: "Built something in the club?", ko: "동아리에서 만든 작품이 있나요?" }}
      link={{ en: "Add it to the archive", ko: "아카이브에 올리기" }}
    />
  );
}
