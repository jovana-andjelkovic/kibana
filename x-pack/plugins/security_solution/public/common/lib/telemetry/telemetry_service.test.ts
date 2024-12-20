/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { coreMock } from '@kbn/core/server/mocks';
import { telemetryEvents } from './events/telemetry_events';

import { TelemetryService } from './telemetry_service';
import { AlertsEventTypes } from './types';

describe('TelemetryService', () => {
  let service: TelemetryService;

  beforeEach(() => {
    service = new TelemetryService();
  });

  const getSetupParams = () => {
    const mockCoreStart = coreMock.createSetup();
    return {
      analytics: mockCoreStart.analytics,
    };
  };

  describe('#setup()', () => {
    it('should register all the custom events', () => {
      const setupParams = getSetupParams();
      service.setup(setupParams);

      expect(setupParams.analytics.registerEventType).toHaveBeenCalledTimes(telemetryEvents.length);

      telemetryEvents.forEach((eventConfig, pos) => {
        expect(setupParams.analytics.registerEventType).toHaveBeenNthCalledWith(
          pos + 1,
          eventConfig
        );
      });
    });
  });

  describe('#start()', () => {
    it('should return the tracking method', () => {
      const setupParams = getSetupParams();
      service.setup(setupParams);
      const telemetry = service.start();

      expect(telemetry).toHaveProperty('reportEvent');
    });
  });

  describe('#reportAlertsGroupingTakeAction', () => {
    it('should report hosts entry click with properties', async () => {
      const setupParams = getSetupParams();
      service.setup(setupParams);
      const telemetry = service.start();

      telemetry.reportEvent(AlertsEventTypes.AlertsGroupingTakeAction, {
        tableId: 'test-groupingId',
        groupNumber: 0,
        status: 'closed',
        groupByField: 'host.name',
      });

      expect(setupParams.analytics.reportEvent).toHaveBeenCalledTimes(1);
      expect(setupParams.analytics.reportEvent).toHaveBeenCalledWith(
        AlertsEventTypes.AlertsGroupingTakeAction,
        {
          tableId: 'test-groupingId',
          groupNumber: 0,
          status: 'closed',
          groupByField: 'host.name',
        }
      );
    });
  });
});
