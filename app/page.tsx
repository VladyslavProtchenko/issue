import { IssueList } from './components/issues/IssueList';

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Issues</h1>
      <IssueList />
    </main>
  );
}
