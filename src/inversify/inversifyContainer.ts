import { ApiInteractionService } from 'api_interaction_services';
import { Container } from 'inversify';
import 'reflect-metadata';
import { API_URL } from '../services/serverRouteConstants';
import { SERVICE_IDENTIFIER } from './inversifyTypes';

const container = new Container();
container
    .bind<ApiInteractionService>(SERVICE_IDENTIFIER.ApiInteractionService)
    .toConstantValue(new ApiInteractionService(API_URL));

export default container;
