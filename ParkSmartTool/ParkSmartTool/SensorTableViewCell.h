//
//  SensorTableViewCell.h
//  ParkSmartTool
//
//  Created by Cef Ramirez on 11/11/15.
//  Copyright © 2015 CMU. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SensorTableViewCell : UITableViewCell

@property (nonatomic, weak) IBOutlet UILabel *sensorIdLabel;
@property (nonatomic, weak) IBOutlet UILabel *valueLabel;
@property (nonatomic, weak) IBOutlet UILabel *timestampLabel;

@end
