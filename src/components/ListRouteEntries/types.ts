export interface ApiError {
  message: string;
  response: {
    status: number;
    data: {
      error: string;
    };
  };
}

export enum RoutingEntityType {
  Sandbox = "Sandbox",
  RouteGroup = "RouteGroup",
}

export interface RoutingEntity {
  name: string;
  routingKey: string;
  type: RoutingEntityType;
}
