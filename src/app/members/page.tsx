import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

interface Member {
  _id: string;
  name: string;
  role?: string;
  team?: string;
  photo?: { asset: { _ref: string } };
  order?: number;
}

async function getMembers(): Promise<Member[]> {
  return client.fetch(
    `*[_type == "member"] | order(order asc, name asc) {
      _id,
      name,
      role,
      team,
      photo,
      order
    }`
  );
}

function SigmaPlaceholder() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-24 h-24 opacity-60"
    >
      <rect x="40" y="20" width="120" height="10" stroke="white" strokeWidth="2" fill="none" />
      <rect x="40" y="170" width="120" height="10" stroke="white" strokeWidth="2" fill="none" />
      <line x1="40" y1="20" x2="100" y2="100" stroke="white" strokeWidth="2" />
      <line x1="40" y1="180" x2="100" y2="100" stroke="white" strokeWidth="2" />
      <line x1="100" y1="100" x2="160" y2="20" stroke="white" strokeWidth="2" />
      <line x1="100" y1="100" x2="160" y2="180" stroke="white" strokeWidth="2" />
    </svg>
  );
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="min-h-screen bg-white text-dark dark:bg-dark dark:text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16 md:px-10 lg:px-16">
        <section className="mb-14 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Members</h1>
          <p className="mx-auto max-w-2xl text-lg text-gray">
            The people behind Sigma Intelligence.
          </p>
        </section>

        {members.length === 0 ? (
          <div className="py-24 text-center text-gray">
            <p className="text-lg">Members will be listed here soon.</p>
          </div>
        ) : (
          <section>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          </section>
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
    <div className="overflow-hidden rounded-xl border border-gray/20 bg-white dark:border-white/10 dark:bg-white/5">
      <div className="relative flex aspect-square w-full items-center justify-center bg-dark/10 dark:bg-dark/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <SigmaPlaceholder />
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-dark dark:text-white">{member.name}</p>
        {member.role && (
          <p className="mt-0.5 text-sm text-gray">{member.role}</p>
        )}
      </div>
    </div>
  );
}
