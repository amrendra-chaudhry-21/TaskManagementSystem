import "./SearchBox.css";
import { IoSearch } from "react-icons/io5";

const SearchBox = () => {
  return (
    <div className="searchBox d-flex align-items-center">
      <IoSearch className="mr-2" />
      <input type="text" placeholder="Search here..." />
    </div>
  );
};

export default SearchBox;
