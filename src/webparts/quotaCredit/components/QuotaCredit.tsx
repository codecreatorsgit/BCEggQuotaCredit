import * as React from 'react';
import type { IQuotaCreditProps } from './IQuotaCreditProps';
import './style.css'
import { ApiService } from '../../services/apiservices';
import { alerts, listNames } from '../../common/constants/ListNames';
const editicon = require('../assets/edit.png')
const deleteicon = require('../assets/delete.png')


const QuotaCredit: React.FC<IQuotaCreditProps> = ({ context }) => {
  const [Producers, setProducers]: any = React.useState([]);
  const [QuotaCredit, setQuotaCredit]: any = React.useState([]);
  const [QuotaCredittype, setQuotaCredittype]: any = React.useState([]);
  const [showmodel, setshowmodel] = React.useState(false);
  const [formData, setFormData] = React.useState<any>({
    QuotaCreditType: '',
    QuantityperWeek: '',
    Flock: '',
    ApplicationDate: new Date().toISOString().split('T')[0],
    StartDate: '',
    EndDate: '',
    Description: ''
  });
  let subtype = React.useRef('')


  const api = new ApiService(context)


  React.useEffect(() => {
    const produceritems = async () => {
      const user = await api.getCurrentUser();
      const producerdowndata = await api.filterListItems(listNames.ProducerInformation, `BCEggAccount/Id eq ${user.Id}`, "Producer")

      let quotaCreditdowndata = await api.getListItems(listNames.QuotaCreditType, 'Title');
      let quotaCreditTypedowndata = await api.getListItems(listNames.QuotaCreditTypes, 'Id,Title,Subtype,SubType_x0020__x002d__x0020_Desc');

      setProducers(producerdowndata)
      setQuotaCredit(quotaCreditdowndata)
      setQuotaCredittype(quotaCreditTypedowndata)
      console.log(quotaCreditTypedowndata)
    };
    produceritems();

  }, [])

  const calculateEndDate = (startDate: string) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 91); 
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'StartDate') {
      const endDate = calculateEndDate(value);

      setFormData((prev: any) => ({
        ...prev,
        StartDate: value,
        EndDate: endDate
      }));
    }
    else {
      setFormData((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
    if (name === "QuotaCreditType") {
      let qtype = QuotaCredittype?.filter((item: any) => item?.Id === Number(value));
      console.log(qtype, 'qtype');
      subtype.current = qtype?.[0]?.Title
    }
  };

  const handleSubmit = async () => {
    try {
    const requiredFields = [
      'QuotaCreditType',
      'QuantityperWeek',
      'Flock',
      'ApplicationDate',
      'StartDate',
      'EndDate',
      'Description'
    ];

    const emptyField = requiredFields.find((field:any) => !formData[field]);
    if (emptyField) {
      alert(`${alerts.RequiredFields} ${emptyField}`);
      return;
    }
      const payload: any = {
        QuotaCreditTypeId: Number(formData.QuotaCreditType), 
        QuantityperWeek: Number(formData.QuantityperWeek),
        Flock: formData.Flock,
        ApplicationDate: formData.ApplicationDate,
        StartDate: formData.StartDate,
        EndDate: formData.EndDate,
        Description: formData.Description
      };
      return;
      await api.insertRecord(
        listNames.FinalQuotaCreditUsageList,
        payload
      );
      alert(alerts.SuccessFullySubmited);

      setFormData({
        QuotaCreditType: '',
        QuantityperWeek: '',
        Flock: '',
        ApplicationDate: '',
        StartDate: '',
        EndDate: '',
        Description: ''
      });

      setshowmodel(false);

    } catch (error) {
      console.error(error);
      alert(alerts.catcherrors);
    }
  };

  return (
    <>
      {showmodel &&
        <div className="quota-modal-overlay" id="transactionModal">
          <div className="quota-modal">

            <h2>Add Quota Credit Usage Transaction</h2>

            <div className="quota-form-row">
              <div className="quota-form-group">
                <label>Quota Credit Type <span>*</span></label>
                <select
                  name="QuotaCreditType"
                  value={formData.QuotaCreditType}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {QuotaCredittype?.map((item: any) => (
                    <option
                      key={item.Id}
                      value={item.Id}
                    >
                      {item.SubType_x0020__x002d__x0020_Desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="quota-form-group">
                <label>Quantity per Week <span>*</span></label>
                <input
                  type="number"
                  name="QuantityperWeek"
                  value={formData.QuantityperWeek}
                  onChange={handleChange}
                  placeholder="Enter"
                />
              </div>
            </div>

            <div className="quota-form-row">
              <div className="quota-form-group">
                <label>Flock <span>*</span></label>
                <input
                  type="text"
                  name="Flock"
                  value={formData.Flock}
                  onChange={handleChange}
                  placeholder="Enter"
                />
              </div>

              <div className="quota-form-group">
                <label>Application Date <span>*</span></label>
                <input
                  type="date"
                  name="ApplicationDate"
                  value={formData.ApplicationDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="quota-form-row">
              <div className="quota-form-group">
                <label>Start Date <span>*</span></label>
                <input
                  type="date"
                  name="StartDate"
                  value={formData.StartDate}
                  onChange={handleChange}
                />
              </div>

              <div className="quota-form-group">
                <label>End Date <span>*</span></label>
                <input
                  type="date"
                  name="EndDate"
                  value={formData.EndDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="quota-form-group">
              <label>Description <span>*</span></label>
              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                placeholder="Enter"
              />
            </div>

            <div className="quota-modal-actions">
              <button className="btn-cancel" onClick={() => setshowmodel(false)}>
                Cancel
              </button>

              <button className="btn-submit" onClick={handleSubmit}>
                Submit
              </button>
            </div>

          </div>
        </div>


      }

             <div className="quota-form-row">
              <div className="quota-form-group">
          <label>Producers <span>*</span></label>
                 <select>
            {/* <option disabled selected>Select Procedure</option> */}
            {Producers?.map((item: any) => {
              return (
                <option value={item?.Producer}>{item?.Producer}</option>
              )
            })}
          </select>
              </div>

              <div className="quota-form-group">
          <label>Quota Credit Transaction Types <span>*</span></label>
                <select>
            {/* <option disabled selected>Select Quota Credit</option> */}
            {QuotaCredit?.map((item: any) => {
              return (
                <option value={item?.Title}>{item?.Title}</option>
              )
            })}
          </select>
              </div>
                  <div className="btn-group">
          <button className="btn-cancel">Cancel</button>
          <button className="btn-submit">Submit</button>
        </div>
             </div>

      <div className="card">
        <div className="balance-title">Total Quota Credit Usage Balance</div>
        <div className="balance-label">Quota Credit Balance</div>
        <div className="balance-value">110671</div>
      </div><div className="card">
        <div className="section-header">
          <h2>Quota Credit Transaction</h2>
          <button className="btn-add" onClick={() => setshowmodel(prev => !prev)}>Add Transaction</button>
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
                <th>Application Date</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Expiry Notified</th>
                <th>Description</th>
                <th>Transaction Complete Flag</th>
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
                <td>21</td>
                <td>21</td>
                <td>21</td>
                <td>21</td>
                <td>21</td>
                <td>21</td>
                <td>21</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div></>
  )
}

export default QuotaCredit
