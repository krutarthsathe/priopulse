import { callDependencies } from '../../../../../lib/call-runtime';
import { reviewCall } from '../../../../../lib/call-service';
export const runtime = 'nodejs';
export async function POST(request, { params }) { const { id } = await params; return reviewCall(request, id, callDependencies); }
