import React from 'react';
import { connect } from 'react-redux';
import { compose, withHandlers } from 'recompose';
import { Map } from 'immutable';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { COLUMN_ACCOUNT_KEY, COLUMN_ACCOUNT_VALUE } from 'lib/constants/personasImport';
import * as personasImportHelpers from 'lib/services/importPersonas/personasImportHelpers';
import { updateModel } from 'ui/redux/modules/models';
import FieldTypeForm from './FieldTypeForm';
import PrimaryForm from './PrimaryForm';
import AccountNameForm from './AccountNameForm';
import AccountHomePageForm from './AccountHomePageForm';
import styles from './styles.css';

const handlers = {
  onColumnTypeChange: ({
    columnStructure,
    model,
    updateModel: doUpdateModel,
  }) => (event) => {
    const columnName = columnStructure.get('columnName', '');
    const resetStructure = personasImportHelpers.resetRelatedStructure({
      structure: model.get('structure', new Map()),
      columnName,
    });

    let newStructure = resetStructure.setIn([columnName, 'columnType'], event.target.value);

    if (event.target.value === COLUMN_ACCOUNT_VALUE) {
      newStructure = newStructure.setIn([columnName, 'useConstant'], true);
    }

    const isOrderable = personasImportHelpers.isColumnOrderable({
      columnStructure: newStructure.get(columnName).toJS(),
    });

    const newPrimary = isOrderable
      ? personasImportHelpers.getPrimaryMaxPlusOne({ structure: newStructure })
      : null;

    newStructure = newStructure.setIn([columnName, 'primary'], newPrimary);

    doUpdateModel({
      schema: 'personasImport',
      id: model.get('_id'),
      path: 'structure',
      value: newStructure,
    });
  },

  onPrimaryOrderChange: ({
    columnStructure,
    model,
    updateModel: doUpdateModel,
  }) => (event) => {
    const columnName = columnStructure.get('columnName', '');
    doUpdateModel({
      schema: 'personasImport',
      id: model.get('_id'),
      path: ['structure', columnName, 'primary'],
      value: parseInt(event.target.value),
    });
  },

  onRelatedColumnChange: ({
    columnStructure,
    model,
    updateModel: doUpdateModel,
  }) => (event) => {
    const columnName = columnStructure.get('columnName', '');
    const newStructure = personasImportHelpers.updateRelatedStructure({
      structure: model.get('structure'),
      columnName,
      relatedColumn: event.target.value
    });

    doUpdateModel({
      schema: 'personasImport',
      id: model.get('_id'),
      path: 'structure',
      value: newStructure,
    });
  },

  onUseConstantChange: ({
    columnStructure,
    model,
    updateModel: doUpdateModel,
  }) => (useConstant) => {
    const columnName = columnStructure.get('columnName', '');

    let newStructure = model
      .get('structure')
      .setIn([columnName, 'useConstant'], useConstant);

    if (useConstant) {
      // deselect any related columns
      newStructure = personasImportHelpers.updateRelatedStructure({
        structure: newStructure,
        columnName,
        relatedColumn: ''
      });
    }

    if (!newStructure.hasIn([columnName, 'primary'])) {
      newStructure = newStructure.setIn(
        [columnName, 'primary'],
        personasImportHelpers.getPrimaryMaxPlusOne({ structure: newStructure })
      );
    }

    doUpdateModel({
      schema: 'personasImport',
      id: model.get('_id'),
      path: 'structure',
      value: newStructure,
    });
  },

  onConstantChange: ({
    columnStructure,
    model,
    updateModel: doUpdateModel,
  }) => (constant) => {
    const columnName = columnStructure.get('columnName', '');

    const newStructure = model
      .get('structure')
      .setIn([columnName, 'constant'], constant);

    doUpdateModel({
      schema: 'personasImport',
      id: model.get('_id'),
      path: 'structure',
      value: newStructure,
    });
  }
};

const InputFields = ({
  columnStructure,
  model,
  disabled,
  onColumnTypeChange,
  onPrimaryOrderChange,
  onRelatedColumnChange,
  onUseConstantChange,
  onConstantChange,
}) => {
  const isColumnOrderable = personasImportHelpers.isColumnOrderable({ columnStructure: columnStructure.toJS() });

  return (
    <td className={`${styles.td} ${styles.inputFields}`}>
      <FieldTypeForm
        columnType={columnStructure.get('columnType', '')}
        onChange={onColumnTypeChange}
        disabled={disabled} />

      {isColumnOrderable && (
        <PrimaryForm
          primary={columnStructure.get('primary')}
          onChange={onPrimaryOrderChange}
          disabled={disabled} />
      )}


      {columnStructure.get('columnType') === COLUMN_ACCOUNT_KEY && (
        <AccountNameForm
          relatedColumn={columnStructure.get('relatedColumn')} />
      )}

      {columnStructure.get('columnType') === COLUMN_ACCOUNT_VALUE && (
        <AccountHomePageForm
          disabled={disabled}
          structure={model.get('structure', new Map())}
          relatedColumn={columnStructure.get('relatedColumn')}
          useConstant={columnStructure.get('useConstant', false)}
          constant={columnStructure.get('constant', '')}
          onRelatedColumnChange={onRelatedColumnChange}
          onUseConstantChange={onUseConstantChange}
          onConstantChange={onConstantChange} />
      )}
    </td>
  );
};

export default compose(
  withStyles(styles),
  connect(
    state => state,
    { updateModel },
  ),
  withHandlers(handlers),
)(InputFields);
