import React, { useState, useRef } from 'react';
import { useMutation, queryCache } from 'react-query';

import { server_url, api_path } from "../constants.js";
import { makeTypeSelector } from "./elements/type_helpers.js";
import { SelectPartFormElement } from "./elements/select_part.js";


export function WithdrawPartForm() {

  let [quantity, setQuantity] = useState("");
  let [typeFilter, setTypeFilter] = useState("");

  let partIDRef = useRef(null);

  let [result, setResult] = useState("");
  let [resultWasError, setResultWasError] = useState("");

  const [mutate, { error }] = useMutation(({ to_submit }) => fetch(
    server_url + api_path + "inventory/actions/withdraw",
    {
      method: "PUT",
      headers: {"content_type": "application/json"},
      body: JSON.stringify(to_submit)
    }).then(res => res.json),
    {
      onSuccess: async () => {
        queryCache.invalidateQueries("inventory/fetch")
      }
    },
  );

  async function handleSubmit(e){
    e.preventDefault();
    let to_submit = {
      id: partIDRef.current,
      quantity: quantity,
    }
    if (!(partIDRef.current && quantity)){
      setResult("Form incomplete.");
      setResultWasError(true);
      return;
    }

    console.log("Submitting:", to_submit);
    try {
      await mutate({ to_submit });
    } catch (error) {
      console.log("ERROR SUBMITTING", error);
    }

    if (error) {
      setResult("Failed! Request error:", error.message);
      setResultWasError(true);
    } else {
      setResult("Success!")
      setResultWasError(false);
      setQuantity("")
      document.getElementById("withdraw_part").reset();
    }
  }

  return (
    <div className="Form">
      <div className="FormBox">
        <div className="FormRow">
          <p className="RowFormTitle">Withdraw Part: </p>
          <div className="ResultReport">
            { result
              ? resultWasError
                ? <p className="ResultErrorReport">{ result }</p>
                : <p className="ResultSuccessReport">{ result }</p>
              : <></>
            }
          </div>
        </div>
        <form id="withdraw_part" className="RowFormContent" onSubmit={handleSubmit}>
          <div className="FormRow">
            <label>
              Filter Parts:
              { makeTypeSelector(
                  typeFilter, "typeFilter",
                  e => setTypeFilter(e.target.value),
                  true
                )
              }
            </label>
            <SelectPartFormElement partIDRef={partIDRef} partType={typeFilter}/>
            <label>
              Quantity:
              <input
                type="number"
                name="quantity"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </label>
          </div>
          <input type="submit" value="Submit" />
        </form>
      </div>
    </div>
  );
}
