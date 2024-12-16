interface ReturnPolicyCardProps {
  policy: string;
  conditions: string[];
  process: string;
}

export function ReturnPolicyCard({ policy, conditions, process }: ReturnPolicyCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="border-b bg-gray-50 px-4 py-3">
        <h3 className="font-semibold text-gray-900">Return Policy</h3>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Main Policy */}
        <div className="flex items-center gap-2 text-lg text-blue-600">
          <span>✨</span>
          <p className="font-medium">{policy}</p>
        </div>

        {/* Conditions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-500">Conditions</h4>
          <ul className="space-y-1">
            {conditions.map((condition, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                <span className="text-gray-700">{condition}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Process */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-500">Return Process</h4>
          <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700">
            {process.split('\n').map((step, index) => (
              <p key={index} className="mb-1 last:mb-0">{step}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 