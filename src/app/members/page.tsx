import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";
import { T } from "@/components/T";

export const metadata: Metadata = {
  title: "임원진",
  description:
    "시그마 인텔리전스 임원진 소개. 서울대학교 로봇동아리를 이끄는 사람들.",
};

interface Member {
  _id: string;
  name: string;
  role?: string;
  team?: string;
  photo?: { asset: { _ref: string } };
  order?: number;
}

async function getMembers(): Promise<Member[]> {
  const { data } = await sanityFetch({
    query: `*[_type == "member"] | order(order asc, name asc) {
      _id,
      name,
      role,
      team,
      photo,
      order
    }`,
  });
  return data;
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div>
      <Navbar />
      <main>
        <section>
          <h1>
            <T en="Members" ko="멤버" />
          </h1>
          <p>
            <T
              en="The people behind Sigma Intelligence."
              ko="2026 시그마 인텔리전스를 이끄는 사람들."
            />
          </p>
        </section>

        {members.length === 0 ? (
          <p>
            <T
              en="Members will be listed here soon."
              ko="멤버 정보가 곧 업데이트됩니다."
            />
          </p>
        ) : (
          <ul>
            {members.map((member) => (
              <li key={member._id}>
                <MemberCard member={member} />
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}

function MemberCard({ member }: { member: Member }) {
  const imageUrl = member.photo
    ? urlFor(member.photo).width(400).height(400).url()
    : null;

  return (
    <article>
      {imageUrl && (
        <Image src={imageUrl} alt={member.name} width={400} height={400} />
      )}
      <p>{member.name}</p>
      {member.role && <p>{member.role}</p>}
    </article>
  );
}
