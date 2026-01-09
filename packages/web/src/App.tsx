import { trpc } from './trpc';

export default function App() {
  trpc.kanban.getTasks.useQuery();

  return null;
}
