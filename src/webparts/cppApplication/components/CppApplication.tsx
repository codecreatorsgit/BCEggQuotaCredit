import * as React from 'react';
import styles from './CppApplication.module.scss';
import type { ICppApplicationProps } from './ICppApplicationProps';
import './style.css';
import { alerts, BarnfieldNamesMap, listNames, status } from '../../common/constants/ListNames';
import { ApiService } from '../../services/apiservices';
import { formatDate, formatDateFromString, getCurrentDate } from '../../common/utils/helperfunctions';
import { CPPService } from '../../business/cppservice';

const editicon = require('../assets/edit.png');
const deleteicon = require('../assets/delete.png');

const CppApplication: React.FC<ICppApplicationProps> = (props) => {
  const { hasTeamsContext } = props;

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [popup, setpopup] = React.useState(false);
  const [producerkey, setproducerkey] = React.useState<any>('');
  const [producerNoSelected, setproducerNoSelected] = React.useState<any>('');
  const [pulletGrowerSelected, setpulletGrowerSelected] = React.useState<any>('');
  const [epuAddressSelected, setepuAddressSelected] = React.useState<any>('');
  const [hatcherySelected, sethatcherySelected] = React.useState<any>('');
  const [hatcheryOther,] = React.useState<any>('');
  const [premiseIdSelected, setpremiseIdSelected] = React.useState<any>('');
  const [Producers, setProducers] = React.useState<any>([]);
  const [BarnTable, setBarnTable] = React.useState<any>([]);
  const [EPUAddresses, setEPUAddresses] = React.useState<any>([]);
  const [pulletGrowers, setPulletGrowers] = React.useState<any>([]);
  const [hatcheries, setHatcheries] = React.useState<any>([]);
  const [barn, setBarn] = React.useState<any>([]);
  const [formStatus, setFormStatus] = React.useState<'submitting' | 'editing'>('submitting');
  const [editId, setEditId] = React.useState<any>(null);
  const [oneNineWeekDate, setoneNineWeekDate] = React.useState<any>(null);
  const [sevenTwoWeekDate, setsevenTwoWeekDate] = React.useState<any>(null);
  const [formoneId, setformoneId]: any = React.useState(0);
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
    const loadInit = async () => {
      const user = await api.getCurrentUser();

      const producers = await api.filterListItems(
        listNames.ProducerInformation,
        `BCEggAccount/Id eq ${user.Id}`,
        "*"
      );

      const hatcheries = await api.getListItems(
        listNames.Hatcheries,
        "*"
      );

      setHatcheries(hatcheries);
      setProducers(producers);
      setproducerkey(producers?.[0]?.ID);
      await producerOnChange(producers?.[0]?.Title);
      setpulletGrowerSelected("Self Grown");
      sethatcherySelected(hatcheries[0].field_4);
    };

    loadInit();
    getPendingBarns()
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (name === "Bc_RequestedHatchDate") {
      setoneNineWeekDate(formatDate(CPPService.calculateWeekOneNineDate(value)))
      setsevenTwoWeekDate(formatDate(CPPService.calculateWeekSevenTwoDate(value)))
    }
  };

  async function filterbyProducer(e: React.ChangeEvent<HTMLSelectElement>) {
    setproducerkey(e.target.value);
    let producerNumber = Producers.find((x: { ID: Number; }) => { return x.ID === Number(e.target.value) }).Title
    setproducerNoSelected(producerNumber);
    console.log(producerNoSelected)
    await producerOnChange(producerNumber);
  }

  const calculate19WeekDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + (19 * 7));
    return formatDate(date);
  };

  const calculate72WeekDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + (72 * 7));
    return formatDate(date);
  };
  async function filterbyEPUAddress(e: React.ChangeEvent<HTMLSelectElement>) {
    setpremiseIdSelected(e.target.value);
    setepuAddressSelected(e.target.name);
  }

  async function filterbyPulletGrower(e: React.ChangeEvent<HTMLSelectElement>) {
    setpulletGrowerSelected(e.target.value);
  }

  async function filterbyHatchery(e: React.ChangeEvent<HTMLSelectElement>) {
    sethatcherySelected(e.target.value);
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
      Bc_RequestedHatchDate: calculate19WeekDate(),
      Bc_OfChicksOrdered: '',
      Bc_ProductionType: '',
      Bc_HousingSystem: '',
      Bc_EstimateRemovalDate: calculate72WeekDate(),
      Bc_RequestedRemovalDate: ''
    });

    setpopup(true);
  };
  const openEditPopup = (item: any, id: any) => {
    setFormStatus('editing');
    setEditId(item.id);
    setformoneId(item?.ID ?? id);

    const hatchDate = item.Bc_RequestedHatchDate
      ? item.Bc_RequestedHatchDate.split('T')[0]
      : '';

    const removalDate = item.Bc_RequestedRemovalDate
      ? item.Bc_RequestedRemovalDate.split('T')[0]
      : '';

    setFormData({
      Bc_Barn: item.Bc_Barn,
      Bc_RequestedHatchDate: hatchDate,
      Bc_OfChicksOrdered: item.Bc_OfChicksOrdered,
      Bc_ProductionType: item.Bc_ProductionType,
      Bc_HousingSystem: item.Bc_HousingSystem,
      Bc_EstimateRemovalDate: item.Bc_EstimateRemovalDate,
      Bc_RequestedRemovalDate: removalDate
    });

    if (hatchDate) {
      setoneNineWeekDate(
        formatDate(CPPService.calculateWeekOneNineDate(hatchDate))
      );

      setsevenTwoWeekDate(
        formatDate(CPPService.calculateWeekSevenTwoDate(hatchDate))
      );
    }

    setpopup(true);
  };

  const producerOnChange = async (producerNumber: string) => {
    const producerpremises = await api.filterListItems(
      listNames.FinalProducerPremiseBarns,
      `Title eq '${producerNumber}'`,
      "*"
    );
    const premiseTitles = producerpremises
      .map(item => item.field_1)
      .filter(Boolean); // remove null/undefined

    const premiseBarns = producerpremises
      .map(item => ({ BarnNumber: item.field_3 }))
      .filter(item => item.BarnNumber);

    setBarn(premiseBarns);

    const premiseFilterValues = premiseTitles
      .map(val => `Title eq '${val.replace(/'/g, "''")}'`) // escape single quotes
      .join(" or ");

    const premises = await api.filterListItems(
      listNames.FinalPremises,
      `${premiseFilterValues}`,
      "*"
    );
    setEPUAddresses(premises);
    setepuAddressSelected(premises[0].field_2);
    setpremiseIdSelected(premises[0].Title);

    const pulletGrowers = await api.filterListItems(
      listNames.PulletGrowers,
      `Title eq '${producerNumber}'`,
      "*"
    );
    setPulletGrowers(pulletGrowers);
  }

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

const updatingFormTemp = async () => {
  try {
    if (!validateForm()) return;

    // ================= TEMP UPDATE =================
    if (Number(formoneId) < 0) {

      const updatedTable = BarnTable.map((item: any) =>
        Number(item.id) === Number(formoneId)
          ? { ...item, ...formData }
          : item
      );

      setBarnTable(updatedTable);

      alert(alerts.SuccessFullyupdated);
      setpopup(false);
      return;

    }

    // ================= SHAREPOINT UPDATE =================
    let payload = CPPService.ProducerBarnFormpayload(
      formData,
      formoneId
    );

    await api.updateRecord(
      formoneId,
      listNames.ProducerBarn,
      payload
    );

    const savedRows = await getPendingBarns();
    const tempRows = BarnTable.filter((tb: any) => tb.id < 0);

    const normalizedSavedRows = savedRows.map((item: any) => {

      const existing = tempRows.find(
        (tb: any) =>
          Number(tb.id) === Number(item.bcegg_CppRequestId?.ID)
      );

      return {
        ...item,
        ...(existing || {})
      };
    });

    setBarnTable([...normalizedSavedRows, ...tempRows]);

    alert(alerts.SuccessFullyupdated);
    setpopup(false);

  } catch (error) {
    console.error("Update Error:", error);
  }
};
console.log(editId)

  const handleAllCancel = () => {
    window.location.href = "https://bcemb.sharepoint.com/sites/BCEggAdminPortal";
  };
  const submitCPPForm = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);

      let obj = {
        producerkey,
        hatcherySelected,
        pulletGrowerSelected,
        premiseIdSelected,
        epuAddressSelected
      }
      const tempItems = BarnTable.filter((tb: any) => tb.id < 0);
      console.log('Items to Submit:', tempItems);
      if (!tempItems.length) {
        alert(alerts.CppNotransactions);
        return;
      }

      let CPPPayload = CPPService.CPPRequestsFormpayload(status.PendingApproval, obj);
      let recordId = await api.insertRecord(listNames.CPPRequests, CPPPayload);
      const tempRows = BarnTable.filter((item: any) => item.id < 0);

      for (const barnTable of tempRows) {
        let barnPayload =
          CPPService.ProducerBarnFormpayload(barnTable, recordId);
        await api.insertRecord(listNames.ProducerBarn, barnPayload);
      }

      alert(alerts.SuccessFullySubmited);
      setBarnTable([]);
      window.location.reload();

    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPendingBarns = async (): Promise<any> => {
    try {
      const itemsbarn = await api.filterListItemsWithExpand(
        listNames.ProducerBarn,
        ``,
        '*,bcegg_CppRequestId/ID',
        'bcegg_CppRequestId'
      );

      if (itemsbarn.length === 0) {
        setBarnTable([]);
        return;
      }

      let cppIds: number[] = [];

      for (let item of itemsbarn) {
        const data = await api.filterListItemsWithExpand(
          listNames.CPPRequests,
          `bcegg_status eq '${status.PendingApproval}' and ID eq ${item?.bcegg_CppRequestId?.ID}`,
          'ID',
          ''
        );

        if (data.length > 0) {
          cppIds.push(item?.bcegg_CppRequestId?.ID);
        }
      }

      console.log("Matched CPP IDs:", cppIds);

      const filteredBarns = itemsbarn.filter((item: any) =>
        cppIds.includes(item?.bcegg_CppRequestId?.ID)
      );

      console.log("Final Barn Data:", filteredBarns);

      setBarnTable(filteredBarns);

      return filteredBarns

    } catch (err) {
      console.error("Error fetching barns:", err);
    }
  };

  const deletingitem = async (item: any, id: any) => {
    try {
      const confirmed = window.confirm(alerts.deleteconfirm);
      if (!confirmed) return;

      console.log("Deleting Item:", item);

      if (id !== undefined && id !== null && id < 0) {
        setBarnTable((prev: any[]) => prev.filter(row => row.id !== id));
        return;
      }
      await api.deleteRecord(item?.ID, listNames.ProducerBarn);

      setBarnTable((prev: any[]) =>
        prev.filter(row => row.ID !== item.ID)
      );

    } catch (error) {
      console.error("Delete Error:", error);
      alert(alerts.catcherrors);
    }
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
                    {barn?.map((item: any) => (
                      <option value={item?.BarnNumber}>{item?.BarnNumber}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Chicks Ordered <span>*</span></label>
                  <input type="text" name="Bc_OfChicksOrdered" value={formData.Bc_OfChicksOrdered} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Requested Hatch Date <span>*</span></label>
                  <input type="date" min={getCurrentDate()} name="Bc_RequestedHatchDate" value={formData.Bc_RequestedHatchDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>19 Week Date <span>*</span></label>
                  <label>{oneNineWeekDate}</label>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Production Type <span>*</span></label>
                  <select name="Bc_ProductionType" value={formData.Bc_ProductionType} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="CAWH - Caged White">CAWH</option>
                    <option value="FABR">FABR</option>
                    <option value="FNBR">FNBR</option>
                    <option value="FNWH">FNWH</option>
                    <option value="ORBR">ORBR</option>
                    <option value="CABR">CABR</option>
                    <option value="CAWH - Caged White">CAWH</option>
                    <option value="ENWH">ENWH</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Housing System <span>*</span></label>
                  {/* <input type="text" name="Bc_HousingSystem" value={formData.Bc_HousingSystem} onChange={handleChange} /> */}
                  {/* <input type="text" name="Bc_HousingSystem" value={formData.Bc_HousingSystem} onChange={handleChange}/> */}
                  <select name="Bc_HousingSystem" value={formData.Bc_HousingSystem} onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="Conventional">Conventional</option>
                    <option value="Enriched">Enriched</option>
                    <option value="Free Run">Free Run</option>
                    <option value="Free Range">Free Range</option>
                    <option value="Organic">Organic</option>
                    <option value="Aviary / Floor">Aviary / Floor</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Estimate Removal Date <span>(based on 72 weeks)</span></label>
                  <input type="date" name="Bc_EstimateRemovalDate" value={sevenTwoWeekDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Requested Removal Date <span></span></label>
                  <input type="date" name="Bc_RequestedRemovalDate" value={formData.Bc_RequestedRemovalDate} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setpopup(false)}>
                  Cancel
                </button>
                <button
                  className={`btn-save ${formStatus === "editing" ? "updateone" : ""}`}
                  onClick={formStatus === "submitting" ? insertRowTemp : updatingFormTemp}>
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
                <option value={item?.Title}>{item?.Producer}</option>
              ))}
            </select>
          </div>

          <div className="header-buttons">
            <button className="btn-cancel" onClick={handleAllCancel}>Cancel</button>
            <button className="btn-history">Applications History</button>
            <button className="btn-submit" onClick={() => submitCPPForm()}>Submit</button>
          </div>
        </div>

        <div className="card">
          <h2>Producer Information</h2>

          <div className="grid-4">
            <div className="form-group">
              <label>EPU Address <span>*</span></label>
              <select onChange={(e) => filterbyEPUAddress(e)}>
                {EPUAddresses?.map((item: any) => (
                  <option value={item?.Title}>{item?.field_2}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Premise ID <span>*</span></label>
              <select disabled={true} value={premiseIdSelected}>
                {EPUAddresses?.map((item: any) => (
                  <option value={item?.Title}>{item?.Title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Pullet Grower <span>*</span></label>
              <select value={pulletGrowerSelected} onChange={(e) => filterbyPulletGrower(e)}>
                <option>Self Grown</option>
                {pulletGrowers?.map((item: any) => (
                  <option>{item?.field_1}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Hatchery <span>*</span></label>
              <select value={hatcherySelected} onChange={(e) => filterbyHatchery(e)}>
                {hatcheries?.map((item: any) => (
                  <option value={item?.field_4}>{item?.field_4}</option>
                ))}
              </select>
              <input type='text' value={hatcheryOther} hidden={hatcherySelected != "Other"}></input>
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
                    <td>{item?.Bc_Barn}</td>
                    <td>{item?.Bc_RequestedHatchDate ? formatDateFromString(item.Bc_RequestedHatchDate) : ''}</td>
                    <td>{item?.Bc_OfChicksOrdered}</td>
                    <td>{item?.Bc_ProductionType}</td>
                    <td>{item?.Bc_HousingSystem}</td>
                    <td>{item?.Bc_EstimateRemovalDate ? formatDateFromString(item.Bc_EstimateRemovalDate) : ''}</td>
                    <td>{item?.Bc_RequestedRemovalDate ? formatDateFromString(item.Bc_RequestedRemovalDate) : ''}</td>
                    <td>
                      <div className="actions">
                        <span className="delete" onClick={() => deletingitem(item, item?.id)}><img src={deleteicon} /></span>
                        <span className="edit" onClick={() => openEditPopup(item, item.id)}>
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