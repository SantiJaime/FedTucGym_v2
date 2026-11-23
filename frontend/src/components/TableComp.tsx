import { ClipboardPlus, SquarePen, Trash2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Table } from "./ui/Table";

interface MembersProps {
  members: FullMemberInfo[];
  headers: string[];
  onClickDelete: (id: number) => void;
  onClickEdit?: (member: FullMemberInfo) => void;
  onClickRegister: (member: FullMemberInfo) => void;
  actions?: boolean;
}

interface TournamentsProps {
  tournaments: Tournament[];
  headers: string[];
  onClickDelete: (id: number) => void;
}

interface MembersTournamentsProps {
  membersTournaments: MembersTournaments[];
  headers: string[];
  onClickDelete?: (
    id_member: number,
    id_tournament: number,
  ) => void;
}

interface ScoresProps {
  scores: Score[];
  headers: string[];
}

export const MembersTableComp: React.FC<MembersProps> = ({
  members,
  headers,
  onClickDelete,
  onClickEdit,
  actions = false,
  onClickRegister,
}) => {
  return (
    <Table>
      <thead>
        <tr className="text-center">
          {headers.map((option) => (
            <th key={option}>{option}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {members?.map((member) => (
          <tr key={member.id}>
            <td data-label={headers[0]}>{member.dni}</td>
            <td data-label={headers[1]}>{member.full_name}</td>
            <td data-label={headers[2]}>
              {member.birth_date} | {member.age} años
            </td>
            <td data-label={headers[3]}>{member.gym}</td>
            <td data-label={headers[4]}>{member.category}</td>
            <td data-label={headers[5]} className="text-center">{member.level}</td>
            <td data-label={headers[6]}>
              {!actions ? (
                <div className="flex justify-evenly gap-2">
                  <Button
                    variant="info"
                    onClick={() => onClickEdit?.(member)}
                  >
                    <SquarePen size={18} />
                    <span>Editar</span>
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onClickDelete(member.id)}
                  >
                    <Trash2 size={18} />
                    <span>Eliminar</span>
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button
                    variant="warning"
                    onClick={() => onClickRegister(member)}
                  >
                    <ClipboardPlus size={18} />
                    <span>Inscribir al torneo</span>
                  </Button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export const MembersNotInTournamentTableComp: React.FC<MembersProps> = ({
  members,
  headers,
  onClickRegister,
}) => {
  return (
    <Table>
      <thead>
        <tr className="text-center">
          {headers.map((option) => (
            <th key={option}>{option}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {members?.map((member) => (
          <tr key={member.id}>
            <td data-label={headers[0]}>{member.dni}</td>
            <td data-label={headers[1]}>{member.full_name}</td>
            <td data-label={headers[2]}>{member.gym}</td>
            <td data-label={headers[3]}>
              <div className="flex justify-center">
                <Button
                  variant="warning"
                  onClick={() => onClickRegister(member)}
                >
                  <ClipboardPlus size={18} />
                  <span>Inscribir al torneo</span>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
export const TournamentsTableComp: React.FC<TournamentsProps> = ({
  tournaments,
  headers,
  onClickDelete,
}) => {
  function formatDateRange(range: string): string {
    const cleaned = range.replace(/[[\]()]/g, "");
    const [start, end] = cleaned.split(",");

    const startDate = new Date(start);
    const endDate = new Date(end);

    endDate.setDate(endDate.getDate() - 1);

    const format = (date: Date) => date.toISOString().split("T")[0];

    return `${format(startDate)} | ${format(endDate)}`;
  }

  return (
    <Table>
      <thead>
        <tr className="text-center">
          {headers.map((option) => (
            <th key={option}>{option}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tournaments?.map((tournament) => (
          <tr key={tournament.id}>
            <td data-label={headers[0]}>{tournament.name}</td>
            <td data-label={headers[1]} className="text-center">
              {formatDateRange(tournament.date_range)}
            </td>
            <td data-label={headers[2]} className="text-center">{tournament.inscription_date_end}</td>
            <td data-label={headers[3]}>
              <div className="flex justify-center">
                <Button
                  variant="danger"
                  onClick={() => onClickDelete(tournament.id)}
                >
                  <Trash2 size={18} />
                  <span>Eliminar</span>
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export const MembersTournamentsTableComp: React.FC<MembersTournamentsProps> = ({
  headers,
  membersTournaments,
  onClickDelete,
}) => {
  return (
    <Table>
      <thead>
        <tr className="text-center">
          {headers.map((option) => (
            <th key={option}>{option}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {membersTournaments?.map((mt) => (
          <tr key={mt.id_member}>
            <td data-label={headers[0]}>{mt.dni}</td>
            <td data-label={headers[1]}>{mt.full_name}</td>
            <td data-label={headers[2]}>{mt.gym}</td>
            <td data-label={headers[3]}>
              <div className="flex justify-center">
                {onClickDelete && (
                  <Button
                    variant="danger"
                    onClick={() =>
                      onClickDelete(mt.id_member, mt.id_tournament)
                    }
                  >
                    <Trash2 size={18} />
                    <span>
                      Eliminar
                    </span>
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export const ScoresTableComp: React.FC<ScoresProps> = ({ headers, scores }) => {
  return (
    <Table>
      <thead>
        <tr className="text-center">
          {headers.map((option) => (
            <th key={option}>{option}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {scores.map((score) => (
          <tr key={score.id}>
            <td data-label={headers[0]}>{score.member_dni}</td>
            <td data-label={headers[1]}>{score.member_name}</td>
            <td data-label={headers[2]}>{score.gym}</td>
            <td data-label={headers[3]} className="text-center">{score.puntaje}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
