import React from "react";

export function LoadingTable({ size, row, colspan }) {
  const render = () => {
    let td = [];
    for (let i = 1; i <= row; i++) {
      td.push(
        <tr key={i}>
          <td colSpan={colspan}>
            <div
              className={`text-center animate-pulse bg-gray-300 rounded h-8`}
            ></div>
          </td>
        </tr>
      );
    }
    return td;
  };

  return render();
}

export default LoadingTable;
