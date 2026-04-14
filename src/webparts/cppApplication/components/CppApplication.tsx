import * as React from 'react';
import styles from './CppApplication.module.scss';
import type { ICppApplicationProps } from './ICppApplicationProps';
import './style.css';
import { alerts, BarnfieldNamesMap, listNames } from '../../common/constants/ListNames';
import { ApiService } from '../../services/apiservices';

const editicon = require('../assets/edit.png');
const deleteicon = require('../assets/delete.png');

const CppApplication: React.FC<ICppApplicationProps> = (props) => {
  const { hasTeamsContext } = props;

  const [popup, setpopup] = React.useState(false);
  const [producerkey, setproducerkey] = React.useState<any>('');
  const [Producers, setProducers] = React.useState<any>([]);
  const [BarnTable, setBarnTable] = React.useState<any>([]);

  const [formStatus, setFormStatus] = React.useState<'submitting' | 'editing'>('submitting');
  const [editId, setEditId] = React.useState<any>(null);

  const [formData, setFormData] = React.useState<any>({
    Bc_Barn: '',
    Bc_RequestedHatchDate: '',
    Bc_OfChicksOrdered: '',
    Bc_ProductionType: '',
    Bc_HousingSystem: '',
    Bc_EstimateRemovalDate: '',
    Bc_RequestedRemovalDate: ''
  });

  const api = React.useMemo(() => new ApiService(props.context), [props.context]);

  React.useEffect(() => {
    const load = async () => {
      const user = await api.getCurrentUser();

      const producers = await api.filterListItems(
        listNames.ProducerInformation,
        `BCEggAccount/Id eq ${user.Id}`,
        "*"
      );

      setProducers(producers);
      setproducerkey(producers?.[0]?.ID);
    };

    load();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

    async function filterbyProducer(e: React.ChangeEvent<HTMLSelectElement>) {
    setproducerkey(e.target.value);
  }
  const validateForm = (): boolean => {
    const requiredFields = [
      'Bc_Barn',
      'Bc_RequestedHatchDate',
      'Bc_OfChicksOrdered',
      'Bc_ProductionType',
      'Bc_HousingSystem',
      'Bc_EstimateRemovalDate',
      'Bc_RequestedRemovalDate'
    ];

    const emptyField = requiredFields.find((f) => !formData[f]);

    if (emptyField) {
      alert(alerts.RequiredFields + BarnfieldNamesMap[emptyField]);
      return false;
    }

    return true;
  };

  const openAddPopup = () => {
    setFormStatus('submitting');
    setEditId(null);

    setFormData({
      Bc_Barn: '',
      Bc_RequestedHatchDate: '',
      Bc_OfChicksOrdered: '',
      Bc_ProductionType: '',
      Bc_HousingSystem: '',
      Bc_EstimateRemovalDate: '',
      Bc_RequestedRemovalDate: ''
    });

    setpopup(true);
  };

  const openEditPopup = (item: any) => {
    setFormStatus('editing');
    setEditId(item.id);

    setFormData({
      Bc_Barn: item.Bc_Barn,
      Bc_RequestedHatchDate: item.Bc_RequestedHatchDate,
      Bc_OfChicksOrdered: item.Bc_OfChicksOrdered,
      Bc_ProductionType: item.Bc_ProductionType,
      Bc_HousingSystem: item.Bc_HousingSystem,
      Bc_EstimateRemovalDate: item.Bc_EstimateRemovalDate,
      Bc_RequestedRemovalDate: item.Bc_RequestedRemovalDate
    });

    setpopup(true);
  };

  const insertRowTemp = () => {
    if (!validateForm()) return;

    const negativeIdCount = BarnTable.filter((i: any) => i.id < 0).length;
    const negatedMaxId = -(negativeIdCount + 1);

    setBarnTable((prev: any) => [
      ...prev,
      { ...formData, id: negatedMaxId }
    ]);

      alert(alerts.SuccessFullySubmited);
    setpopup(false);
  };

  const updatingFormTemp = () => {
    if (!validateForm()) return;

    const updated = BarnTable.map((item: any) =>
      item.id === editId ? { ...item, ...formData } : item
    );

    setBarnTable(updated);

        alert(alerts.SuccessFullySubmited);
    setpopup(false);
  };

  return (
    <section className={`${styles.cppApplication} ${hasTeamsContext ? styles.teams : ''}`}>
      <div className="container">

        {/* ================= POPUP ================= */}
        {popup && (
          <div className="modal-overlay">
            <div className="modal-box">

              <h2>{formStatus === 'editing' ? 'Edit Barn' : 'Add Barn'}</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Barn # <span>*</span></label>
                  <select name="Bc_Barn" value={formData.Bc_Barn} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="3">3</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Requested Hatch Date <span>*</span></label>
                  <input type="date" name="Bc_RequestedHatchDate" value={formData.Bc_RequestedHatchDate} onChange={handleChange}/>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Chicks Ordered <span>*</span></label>
                  <input type="text" name="Bc_OfChicksOrdered" value={formData.Bc_OfChicksOrdered} onChange={handleChange}/>
                </div>

                <div className="form-group">
                  <label>Production Type <span>*</span></label>
                  <select name="Bc_ProductionType" value={formData.Bc_ProductionType} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="CAWH - Caged White">CAWH</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Housing System <span>*</span></label>
                  <input type="text" name="Bc_HousingSystem" value={formData.Bc_HousingSystem} onChange={handleChange}/>
                </div>

                <div className="form-group">
                  <label>Estimate Removal Date <span>*</span></label>
                  <input type="date" name="Bc_EstimateRemovalDate" value={formData.Bc_EstimateRemovalDate} onChange={handleChange}/>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Requested Removal Date <span>*</span></label>
                  <input type="date" name="Bc_RequestedRemovalDate" value={formData.Bc_RequestedRemovalDate} onChange={handleChange}/>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setpopup(false)}>
                  Cancel
                </button>

                <button
                  className={`btn-save ${formStatus === "editing" ? "updateone" : ""}`}
                  onClick={formStatus === "submitting" ? insertRowTemp : updatingFormTemp}
                >
                  {formStatus === "submitting" ? "Save" : "Update"}
                </button>
              </div>

            </div>
          </div>
        )}


     
        {/* ================= HEADER (UNCHANGED EXACTLY) ================= */}
        <div className="header">
          <div className="form-group">
            <label>Producer <span>*</span></label>
            <select value={producerkey} onChange={(e) => filterbyProducer(e)}>
              <option disabled selected>Select Producer</option>
              {Producers?.map((item: any) => (
                <option value={item?.ID}>{item?.Producer}</option>
              ))}
            </select>
          </div>

          <div className="header-buttons">
            <button className="btn-cancel">Cancel</button>
            <button className="btn-history">Applications History</button>
            <button className="btn-submit">Submit</button>
          </div>
        </div>

        <div className="card">
          <h2>Producer Information</h2>

          <div className="grid-4">
            <div className="form-group">
              <label>EPU Address <span>*</span></label>
              <select>
                <option>4808 Mt Lehman Rd</option>
              </select>
            </div>

            <div className="form-group">
              <label>Premise ID <span>*</span></label>
              <select>
                <option>BC339DR3C</option>
              </select>
            </div>

            <div className="form-group">
              <label>Pullet Grower <span>*</span></label>
              <select>
                <option>Self Grown</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hatchery <span>*</span></label>
              <select>
                <option>Self Grown</option>
              </select>
            </div>
          </div>
        </div>
        {/* ================= TABLE ================= */}
        <div className="card">
          <div className="section-header">
            <h2>Barn Table</h2>
            <button className="btn-add" onClick={openAddPopup}>Add Barn</button>
          </div>

    
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Barn #</th>
                  <th>Requested Hatch Date</th>
                  <th># of Chicks Ordered</th>
                  <th>Production Type</th>
                  <th>Housing System</th>
                  <th>Estimate Removal Date</th>
                  <th>Requested Removal Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
              
                {BarnTable.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.Bc_Barn}</td>
                    <td>{item.Bc_RequestedHatchDate}</td>
                    <td>{item.Bc_OfChicksOrdered}</td>
                    <td>{item.Bc_ProductionType}</td>
                    <td>{item.Bc_HousingSystem}</td>
                    <td>{item.Bc_EstimateRemovalDate}</td>
                    <td>{item.Bc_RequestedRemovalDate}</td>
                    <td>
                      <div className="actions">
                        <span className="delete"><img src={deleteicon} /></span>
                        <span className="edit" onClick={() => openEditPopup(item)}>
                          <img src={editicon} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CppApplication;