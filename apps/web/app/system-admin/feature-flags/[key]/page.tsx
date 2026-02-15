import { prisma } from '@salesos/core';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/table';
import { updateFlag, deleteFlag } from '../actions';
import { notFound } from 'next/navigation';

export default async function FeatureFlagDetailsPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const flag = await prisma.featureFlag.findUnique({
    where: { key },
  });

  if (!flag) {
    notFound();
  }

  const updateAction = updateFlag.bind(null, flag.key);
  const deleteAction = deleteFlag.bind(null, flag.key);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Feature Flag: {flag.key}</h1>
        <form action={deleteAction}>
          <button
             type="submit"
             className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
          >
            Delete Flag
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateAction} className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isEnabled"
                  id="isEnabled"
                  defaultChecked={flag.isEnabled}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isEnabled" className="text-sm font-medium text-slate-700">Enabled Globally</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rules (JSON)</label>
                <textarea
                  name="rules"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono h-64"
                  defaultValue={JSON.stringify(flag.rules, null, 2)}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Supported rules: {`{ "percentage": 10, "users": ["id"], "orgs": ["id"] }`}
                </p>
              </div>

              <button
                  type="submit"
                  className="w-full py-2 px-4 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
