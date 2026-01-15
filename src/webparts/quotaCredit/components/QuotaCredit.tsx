import * as React from 'react';
import type { IQuotaCreditProps } from './IQuotaCreditProps';
import './style.css'
import { ApiService } from '../../services/apiservices';
const editicon = require('../assets/edit.png')
const deleteicon = require('../assets/delete.png')


const QuotaCredit: React.FC<IQuotaCreditProps> = ({ context }) => {
  const [Producers, setprocedures]: any = React.useState([]);
  const [QuotaCredit, setQuotaCredit]: any = React.useState([]);
  const [showmodel,setshowmodel] = React.useState(false)

  const api = new ApiService(context)


  React.useEffect(() => {
    const produceritems = async () => {
      const user = await api.getCurrentUser();
      const producerdowndata = await api.camelquery(user.Id, 'Producer Information')

      let quotaCreditdowndata = await api.getListItems('Quota Credit Type', 'Title');

      setprocedures(producerdowndata)
      setQuotaCredit(quotaCreditdowndata)
      console.log(producerdowndata, 'drp Quota Credit Type')
    };
    produceritems();
    console.log(Producers)
  }, [])
  return (
    <>
  {showmodel &&
    <div className="modal-overlay" id="transactionModal">
    <div className="modal">
        <h2>Add Quota Credit Usage Transaction</h2>

        <div className="modal-row">
            <div className="form-group">
                <label>Quota Credit Type <span>*</span></label>
                <select>
                    <option>Select</option>
                    <option>22-Utilized</option>
                </select>
            </div>
            <div className="form-group">
                <label>Quantity per Week <span>*</span></label>
                <input type="number" placeholder="Enter"/>
            </div>
        </div>

        <div className="modal-row">
            <div className="form-group">
                <label>Flock <span>*</span></label>
                <input type="text" placeholder="Enter" />
            </div>
            <div className="form-group">
                <label>Application Date <span>*</span></label>
                <input type="date"/>
            </div>
        </div>

        <div className="modal-row">
            <div className="form-group">
                <label>Start Date <span>*</span></label>
                <input type="date"/>
            </div>
            <div className="form-group">
                <label>End Date <span>*</span></label>
                <input type="date"/>
            </div>
        </div>

        <div className="form-group">
            <label>Description <span>*</span></label>
            <textarea placeholder="Enter"></textarea>
        </div>

        <div className="modal-actions">
            <button className="btn-cancel" onClick={()=> setshowmodel(prev => !prev)}>Cancel</button>
            <button className="btn-submit">Submit</button>
        </div>
    </div>
</div>
  }
    <div className="top-form">
      <div className="form-group">
        <label>Producers <span>*</span></label>
        <select>
          {/* <option disabled selected>Select Procedure</option> */}
          {Producers?.map((item: any) => {
            return (
              <option value="">{item?.Producer}</option>
            )
          })}
        </select>
      </div>

      <div className="form-group">
        <label>Quota Credit Transaction Types <span>*</span></label>
        <select>
          {/* <option disabled selected>Select Quota Credit</option> */}
           {QuotaCredit?.map((item: any) => {
            return (
              <option value="">{item?.Title}</option>
            )
          })}
        </select>
      </div>

      <div className="btn-group">
        <button className="btn-cancel">Cancel</button>
        <button className="btn-submit">Submit</button>
      </div>
    </div><div className="card">
        <div className="balance-title">Total Quota Credit Usage Balance</div>
        <div className="balance-label">Quota Credit Balance</div>
        <div className="balance-value">110671</div>
      </div><div className="card">
        <div className="section-header">
          <h2>Quota Credit Transaction</h2>
          <button className="btn-add" onClick={()=> setshowmodel(prev => !prev)}>Add Transaction</button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Quota Credit Type</th>
                <th>Quantity per Week</th>
                <th>Flock</th>
                <th>Application Date</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>22-Utilized</td>
                <td>413</td>
                <td>-</td>
                <td>12/14/2023</td>
                <td>12/10/2023</td>
                <td>12/30/2023</td>
                <td>Adjust End Date</td>
                <td>
                  <div className="actions">
                    <span className="delete"><img src={deleteicon} alt="deleteicon" /></span>
                    <span className="edit"><img src={editicon} alt="editicon" /></span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div><div className="card">
        <h2 style={{ marginBottom: '15px' }}>Quota Credit Usage Transactions Report</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Quota Credit Type</th>
                <th>Total Quantity</th>
                <th>Quantity per Week</th>
                <th>Number of Weeks</th>
                <th>Quantity per Day</th>
                <th>Number of Days</th>
                <th>Flock</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>22-Utilized</td>
                <td>1239</td>
                <td>413</td>
                <td>2</td>
                <td>59</td>
                <td>21</td>
                <td>-</td>
              </tr>
              <tr>
                <td>2</td>
                <td>22-Utilized</td>
                <td>2424</td>
                <td>404</td>
                <td>5</td>
                <td>57.71428571</td>
                <td>42</td>
                <td>-</td>
              </tr>
              <tr>
                <td>3</td>
                <td>22-Utilized</td>
                <td>1239</td>
                <td>413</td>
                <td>2</td>
                <td>59</td>
                <td>21</td>
                <td>-</td>
              </tr>
              <tr>
                <td>4</td>
                <td>22-Utilized</td>
                <td>2424</td>
                <td>404</td>
                <td>5</td>
                <td>57.71428571</td>
                <td>42</td>
                <td>-</td>
              </tr>
              <tr>
                <td>5</td>
                <td>22-Utilized</td>
                <td>1239</td>
                <td>413</td>
                <td>2</td>
                <td>59</td>
                <td>21</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div></>
  )
}

export default QuotaCredit
