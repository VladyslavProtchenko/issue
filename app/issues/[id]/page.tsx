import { Suspense } from 'react';
import { IssueDetail } from './IssueDetail';

export default async function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-8 py-6 sm:py-10">
      <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
        <IssueDetail id={id} />
      </Suspense>
    </main>
  );
}
