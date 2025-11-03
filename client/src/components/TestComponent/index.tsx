import { Link } from "react-router-dom";
import { Bar } from "./style";

export default function TestComponent() {
  return (
    <Bar>
      <div>Logo</div>
      <nav>
        <Link to="/">Login</Link>
      </nav>
    </Bar>
  );
}
