import type { ReactNode } from "react";
import { Card } from "./ui/Card";

interface Props {
  user: UserInfo | null;
  color: ColorType;
  textColor: "white" | "dark";
  children?: ReactNode;
}

const CardComp: React.FC<Props> = ({ user, color, textColor, children }) => {
  return (
    <Card color={color} className={`mb-2 ${textColor === "white" ? "text-white" : "text-slate-900"}`}>
      <div className="border-b border-black/10 bg-black/10 px-4 py-3 text-center text-2xl font-bold">
        {user?.role}: {user?.full_name}
      </div>
      <div className="p-5 text-center">
        <h2 className="text-xl font-bold">Número de asociado: {user?.userId}</h2>
        {user?.id_category && user.id_category > 1 && (
          <p className="mt-2 text-lg">Categoría: {user.category}</p>
        )}
        {children && <div className="mt-6 flex justify-center">{children}</div>}
      </div>
    </Card>
  );
};

export default CardComp;
