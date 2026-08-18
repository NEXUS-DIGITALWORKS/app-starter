import type { ProductMagentoMetadata } from '../types';

interface ProductMetadataTableProps {
  metadata: ProductMagentoMetadata;
}

const ROWS: { key: keyof ProductMagentoMetadata; label: string }[] = [
  { key: 'entityId', label: 'entity_id' },
  { key: 'sku', label: 'sku' },
  { key: 'metaTitle', label: 'meta_title' },
  { key: 'metaDescription', label: 'meta_description' },
  { key: 'urlKey', label: 'url_key' },
  { key: 'baseImage', label: 'base_image' },
  { key: 'smallImage', label: 'small_image' },
  { key: 'thumbnail', label: 'thumbnail' },
];

export default function ProductMetadataTable({ metadata }: ProductMetadataTableProps) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-[#111827]">元データ / Magento取得値</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <tbody>
            {Array.from({ length: Math.ceil(ROWS.length / 3) }).map((_, rowIdx) => {
              const rowFields = ROWS.slice(rowIdx * 3, rowIdx * 3 + 3);
              return (
                <tr key={rowIdx} className="border-b border-[#EEF0F4] last:border-0">
                  {rowFields.map(({ key, label }) => {
                    const value = metadata[key];
                    return (
                      <td key={key} className="min-w-[160px] py-2 pr-4 align-top">
                        <p className="text-xs text-[#98A2B3]">{label}</p>
                        <p className="mt-0.5 break-all font-medium text-[#344054]">
                          {value === null || value === '' ? <span className="text-[#98A2B3]">NULL</span> : String(value)}
                        </p>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
