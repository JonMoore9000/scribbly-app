import { getNoteById } from '@/lib/firestore';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>; // 👈 asyncParams is ON
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note || !note.public) {
    return {
      title: 'Note not found',
      description: 'This note does not exist or is private',
      robots: 'noindex',
    };
  }

  return {
    title: `${note.title} | Scribbly`,
    description: note.content.slice(0, 150),
    openGraph: {
      title: note.title,
      description: note.content.slice(0, 150),
      type: 'article',
      publishedTime: note.createdAt.toString(),
    },
  };
}

export default async function NotePage({ params }: PageProps) {
  const { id } = await params;
  const note = await getNoteById(id);

  if (!note || !note.public) return notFound();

  const formattedDate = new Date(
    note.createdAt.toDate?.() ?? note.createdAt
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main id="dyn-main" className="max-w-3xl mx-auto mt-4 p-6">

      <article className="bg-gray-100 rounded-lg p-6 shadow-md">
        <header className="mb-6">
          <div className="text-4xl mb-2">{note.emoji}</div>
          <h1 className="text-3xl text-gray-800 font-bold mb-2">
            {note.title}
          </h1>
          <time dateTime={note.createdAt.toString()} className="flex w-fit items-center text-white py-1 px-2 rounded-full text-sm">
            <Calendar size={16} className="mr-1" />{formattedDate}
          </time>
        </header>

        <div className="prose prose-lg dark:prose-invert text-gray-800 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content}
          </ReactMarkdown>
        </div>

        {note.tags?.length > 0 && (
          <footer className="mt-6 flex flex-wrap gap-2">
            {note.tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </footer>
        )}
      </article>
      <p className="text-sm text-gray-500 mt-4">Built with <a className="underline" href="https://www.goscribbly.com/" target='_blank'>Scribbly</a></p>
    </main>
  );
}
