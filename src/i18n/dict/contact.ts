import type { Locale } from "../config";

// The contact page and its form.
type Contact = {
  title: string;
  // Read out before the clock.
  time: string;
  zone: {
    city: string;
    zone: string;
    // How far Seoul is from the reader's own clock: "9 hours ahead of you".
    gap: (hours: number, minutes: number, ahead: boolean) => string;
  };
  facts: { email: string; follow: string };
  // The club's address, one line to a row. The footer prints the same lines.
  address: string[];
  form: {
    name: string;
    email: string;
    from: string;
    optional: string;
    message: string;
    errors: { name: string; email: string; message: string; invalid: string };
    send: string;
    sending: string;
    failed: string;
    asEmail: string;
    sent: string;
    reply: string;
    again: string;
  };
  // What the message opens with from `/contact?about=<key>`.
  drafts: Record<string, string>;
};

export const CONTACT: Record<Locale, Contact> = {
  en: {
    title: "Contact",
    time: "The time in Seoul: ",
    zone: {
      city: "Seoul",
      zone: "KST, UTC+9",
      gap: (hours, minutes, ahead) => {
        const span = [hours ? `${hours} hour${hours === 1 ? "" : "s"}` : "", minutes ? `${minutes} minutes` : ""].filter(Boolean).join(" ");
        return `${span} ${ahead ? "ahead of" : "behind"} you`;
      },
    },
    facts: { email: "Email", follow: "Follow" },
    address: ["Building 302, Room 215‑2", "Seoul National University", "1 Gwanak-ro, Gwanak-gu, Seoul"],
    form: {
      name: "Name",
      email: "Email",
      from: "From",
      optional: "Optional",
      message: "Message",
      errors: {
        name: "Enter your name.",
        email: "Enter your email address.",
        message: "Enter a message.",
        invalid: "Enter a valid email address.",
      },
      send: "Send message",
      sending: "Sending",
      failed: "It could not be sent. ",
      asEmail: "Open it as an email instead",
      sent: "Message sent",
      reply: "We’ll come back to you shortly.",
      again: "Send another",
    },
    drafts: {
      archive: `I'd like to add a build to the archive.

Name:
Year:
Team:
Link (Google Drive or other):`,
      blog: `I'd like to write a post for the blog.

Title:
Author:
Article link (Google Drive or other):

Cover: the section's drawing is used unless the post needs its own. A drawing of your own is black ink on plain paper with one red mark, like a quick sketch in a notebook.
Photos: unedited photographs only. No card news, text overlays, stickers or templates.`,
    },
  },
  ko: {
    title: "문의",
    time: "서울의 현재 시각: ",
    zone: {
      city: "서울",
      zone: "KST, UTC+9",
      gap: (hours, minutes, ahead) => {
        const span = [hours ? `${hours}시간` : "", minutes ? `${minutes}분` : ""].filter(Boolean).join(" ");
        return `현재 위치보다 ${span} ${ahead ? "빠름" : "느림"}`;
      },
    },
    facts: { email: "이메일", follow: "SNS" },
    address: ["서울대학교 302동 215‑2호", "서울특별시 관악구 관악로 1"],
    form: {
      name: "이름",
      email: "이메일",
      from: "소속",
      optional: "선택",
      message: "메시지",
      errors: {
        name: "이름을 입력하세요.",
        email: "이메일 주소를 입력하세요.",
        message: "메시지를 입력하세요.",
        invalid: "올바른 이메일 주소를 입력하세요.",
      },
      send: "메시지 보내기",
      sending: "보내는 중",
      failed: "메시지를 보내지 못했습니다. ",
      asEmail: "이메일로 대신 보내기",
      sent: "메시지를 보냈습니다",
      reply: "곧 답변드리겠습니다.",
      again: "한 번 더 보내기",
    },
    drafts: {
      archive: `아카이브에 제작물을 추가하고 싶습니다.

이름:
연도:
팀:
링크(Google Drive 등):`,
      blog: `블로그에 글을 쓰고 싶습니다.

제목:
작성자:
글 링크(Google Drive 등):

표지: 글에 따로 그림이 필요하지 않으면 해당 분류의 그림을 씁니다. 직접 그린 그림은 공책에 빠르게 그린 스케치처럼, 무지 종이에 검은 잉크로 그리고 빨간 표시를 하나 넣습니다.
사진: 보정하지 않은 사진만 받습니다. 카드뉴스, 글자를 얹은 이미지, 스티커, 템플릿은 받지 않습니다.`,
    },
  },
};
