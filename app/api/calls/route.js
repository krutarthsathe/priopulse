import { callDependencies } from '../../../lib/call-runtime';
import { callHistory, startCall } from '../../../lib/call-service';
export const runtime = 'nodejs';
export const maxDuration = 60;
export const GET = request => callHistory(request, callDependencies);
export const POST = request => startCall(request, callDependencies);
