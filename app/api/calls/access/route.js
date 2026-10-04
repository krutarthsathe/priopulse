import { callDependencies } from '../../../../lib/call-runtime';
import { callAccess } from '../../../../lib/call-service';
export const runtime = 'nodejs';
export const POST = request => callAccess(request, callDependencies);
export const DELETE = request => callAccess(request, callDependencies);
