// 取込データの image 列（例: /1/0/101775621734_0157658996.jpg というMagento形式の
// ハッシュ付きパス）を、ローカル画像アーカイブを配信する開発サーバーのURLに変換する
// （開発サーバーのみ。vite.config.ts の productImagesPlugin 参照）。
// 実データ接続時はMagentoの画像URL（base_image等）に置き換える。
export function getProductImageUrl(imagePath: string): string {
  return `/product-images${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}
