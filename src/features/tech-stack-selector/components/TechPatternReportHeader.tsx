import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type Props = {
  backToSelectorUrl: string;
};

export default function TechPatternReportHeader({ backToSelectorUrl }: Props) {
  return (
    <>
      <span className="tss-eyebrow">構成パターンレポート</span>
      <h1>この技術構成で、何が作れるか。</h1>
      <p>
        選択した技術要素に一致する構成パターンについて、実現できるシステム、採用する理由、向いているケースを整理しました。技術の一致だけでなく、開発後の保守・拡張・運用も含めて構成の特徴を確認できます。
        <br />
        技術要素を選び直す場合は
        <Link to={backToSelectorUrl} className="tss-inline-link">
          <ArrowLeft size={13} />
          技術要素セレクターに戻る
        </Link>
        から行えます。
      </p>
    </>
  );
}
