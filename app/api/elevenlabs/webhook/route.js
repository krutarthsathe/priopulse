import { callDependencies } from '../../../../lib/call-runtime';
import { receiveCallWebhook } from '../../../../lib/call-service';
export const runtime = 'nodejs';
export const POST = request => receiveCallWebhook(request, callDependencies);
