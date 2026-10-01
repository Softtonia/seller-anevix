const fs = require('fs');
const path = 'd:/anevix-admin/src/pages/ProductsVerificationPage.jsx';

let content = fs.readFileSync(path, 'utf8');

// Replace the window.prompt button with a state trigger
const targetBtn = `onClick={async () => {
                            const reason = window.prompt("Enter rejection reason:");
                            if (reason) {
                               const rejectPromise = api.put(\`/products/admin/\${p.id}/reject\`, { reason });
                               toast.promise(rejectPromise, { loading: 'Rejecting...', success: 'Rejected', error: 'Failed' });
                               await rejectPromise;
                               setProducts(products.map(prod => prod.id === p.id ? { ...prod, status: 'rejected' } : prod));
                            }
                          }}`;

const replaceBtn = `onClick={() => {
                            setProductToReject(p);
                            setRejectReason("");
                            setRejectModalOpen(true);
                          }}`;

content = content.replace(targetBtn, replaceBtn);

// Inject the JSX for the rejection modal before the last closing div
const modalJSX = `
      {/* Rejection Modal */}
      {rejectModalOpen && productToReject && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Product</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for rejecting <span className="font-semibold text-gray-700">{productToReject.name}</span>.
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24 mb-4"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                onClick={() => {
                  setRejectModalOpen(false);
                  setProductToReject(null);
                }}
                disabled={rejecting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!rejectReason.trim() || rejecting}
                onClick={async () => {
                  const reason = rejectReason.trim();
                  if (reason) {
                    setRejecting(true);
                    const rejectPromise = api.put(\`/products/admin/\${productToReject.id}/reject\`, { reason });
                    toast.promise(rejectPromise, { loading: 'Rejecting...', success: 'Rejected', error: 'Failed' });
                    try {
                      await rejectPromise;
                      setProducts(products.map(prod => prod.id === productToReject.id ? { ...prod, status: 'rejected' } : prod));
                      setRejectModalOpen(false);
                      setProductToReject(null);
                    } catch (e) {
                      console.error("Failed to reject product:", e);
                    } finally {
                      setRejecting(false);
                    }
                  }
                }}
              >
                {rejecting ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

const replaceTarget = `</div>
  );
}`;

content = content.replace(replaceTarget, modalJSX + '\n' + replaceTarget);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched ProductsVerificationPage.jsx');
