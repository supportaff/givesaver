// This route is intentionally left as a 404 trap.
// The real admin dashboard is at a fixed internal path protected by middleware.
import { notFound } from 'next/navigation';
export default function TrapPage() { notFound(); }
