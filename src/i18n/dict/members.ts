import type { Locale } from "../config";

type Group = "alumni" | "executives" | "members";
type Link = "email" | "instagram" | "github" | "linkedin" | "site";

type Members = {
  title: string;
  groups: Record<Group, string>;
  // The one row of a group with nobody in it: the link to the profile form.
  invite: Partial<Record<Group, string>>;
  viewProfile: (name: string) => string;
  year: string;
  role: string;
  field: string;
  department: string;
  close: string;
  links: Record<Link, string>;
  linkOf: (name: string, label: string) => string;
};

export const MEMBERS: Record<Locale, Members> = {
  en: {
    title: "Members",
    groups: { alumni: "Alumni", executives: "Executives", members: "Members" },
    invite: { alumni: "Add your alumni profile", members: "Add your member profile" },
    viewProfile: (name) => `${name}, view profile`,
    year: "Year",
    role: "Role",
    field: "Field",
    department: "Department",
    close: "Close",
    links: { email: "Email", instagram: "Instagram", github: "GitHub", linkedin: "LinkedIn", site: "Website" },
    linkOf: (name, label) => `${name} on ${label}`,
  },
  ko: {
    title: "구성원",
    groups: { alumni: "졸업생", executives: "임원진", members: "부원" },
    invite: { alumni: "졸업생 프로필을 등록하세요", members: "부원 프로필을 등록하세요" },
    viewProfile: (name) => `${name}, 프로필 보기`,
    year: "연도",
    role: "직책",
    field: "분야",
    department: "학과",
    close: "닫기",
    links: { email: "이메일", instagram: "Instagram", github: "GitHub", linkedin: "LinkedIn", site: "웹사이트" },
    linkOf: (name, label) => `${name}의 ${label}`,
  },
};
