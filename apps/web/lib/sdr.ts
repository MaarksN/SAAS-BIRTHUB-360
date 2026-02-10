export interface ILeadScore {
  leadId: string;
  score: number;
  factors: {
    behavioral: number;
    demographic: number;
  };
}

export interface IObjectionResponse {
  objection: string;
  response: string;
}
